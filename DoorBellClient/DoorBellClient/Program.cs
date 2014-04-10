using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net;
using System.Web;
using System.IO;
using Newtonsoft.Json;
using System.Diagnostics;
using Raspberry.IO.GeneralPurpose;
using FileGPIO;
namespace DoorBellClient
{
    class Program
    {
        static FileGPIO.FileGPIO s_Gpio = new FileGPIO.FileGPIO();
        static DateTime startTime = DateTime.Now;
        static int wrapExpSecs = -1;
        static string deviceID = "325425423";
        static string wrapToken = null;
        static string photoQuality = "50";
        static void Main(string[] args)
        {
            if (args.Length > 0)
            {
                photoQuality = args[0];
            }

            while (true)
            {
                try
                {
                    //Get the service bus authentication - We only need to do this every few hours
                    GetWrapTokenIfExpired();
                    
                    //Poll the pin 10Hz. Assuming a HI true
                    if (s_Gpio.InputPin(FileGPIO.FileGPIO.enumPIN.gpio22))
                    {
                        TakeAndSendPicture();
                    }
                }
                //Never crash. Print the error. Possible connection errors can land us here
                catch (Exception e)
                {
                    Console.WriteLine("Encountered an error. Check this exception " + e);
                    Console.WriteLine("Restarting...");
                }

                System.Threading.Thread.Sleep(100);
            }
        }

        static void GetWrapTokenIfExpired()
        {
            //if this is the first time or the wrap token expired
            if (wrapToken == null || (DateTime.Now.Ticks / 10000) - (startTime.Ticks / 10000) > wrapExpSecs * 1000)
            {
                //TODO Mono should support newer fancier stuff like async/await and the new http libraries for Win8.
                WebRequest request = WebRequest.Create("https://dpeproject-sb.accesscontrol.windows.net/WRAPv0.9");
                request.ContentType = "application/x-www-form-urlencoded";
                request.Method = "POST";
                using (var stream = request.GetRequestStream())
                {
                    string body = "wrap_name=owner&wrap_password=Qk1wJb5uMYKdtbUa637NPI6SDnpYAOT6ee9AI0TGHpU%3D&wrap_scope=http%3A%2F%2Fdpeproject.servicebus.Windows.net%2Farduino%2Fmessages";
                    var bytes = GetBytes(body);
                    stream.Write(bytes, 0, bytes.Length);
                }

                using (var response = request.GetResponse())
                using (StreamReader reader = new StreamReader(response.GetResponseStream()))
                {

                    var wrapRaw = reader.ReadToEnd();
                    Console.WriteLine("Wrap raw " + wrapRaw);
                    string wrapExp = wrapRaw.Split(new string[] { "=" }, StringSplitOptions.RemoveEmptyEntries)[2];
                    //Holy hackary :-). Parse out the pieces of the token return body
                    //Expected WRAP response body is:
                    //wrap_access_token=net.windows.servicebus.action%3dListen%252cManage%252cSend%26http%253a%252f%252fschemas.microsoft.com%252faccesscontrolservice%252f2010%252f07%252fclaims%252fidentityprovider%3dhttps%253a%252f%252fdpeproject-sb.accesscontrol.windows.net%252f%26Audience%3dhttp%253a%252f%252fdpeproject.servicebus.Windows.net%252farduino%252fmessages%26ExpiresOn%3d1396087901%26Issuer%3dhttps%253a%252f%252fdpeproject-sb.accesscontrol.windows.net%252f%26HMACSHA256%3dx%252f%252brjHq2wnN06t9ZO4jkIkQY0s6kuo4TFQG0wJ6sc6s%253d&wrap_access_token_expires_in=10799
                    wrapRaw = wrapRaw.Split(new string[] { "=" }, StringSplitOptions.RemoveEmptyEntries)[1];
                    wrapToken = wrapRaw.Split(new string[] { "&" }, StringSplitOptions.RemoveEmptyEntries)[0];

                    wrapExpSecs = Int32.Parse(wrapExp);

                    wrapToken = HttpUtility.UrlDecode(wrapToken);
                }
            }
        }

        static void TakeAndSendPicture()
        {

                //Get Photo
                WebRequest photoRequest = WebRequest.Create("https://smartdoor.azure-mobile.net/api/photo?doorbellID=" + deviceID);
                photoRequest.Method = "GET";
                PhotoResponse photoResp = null;
                using (var sbPhotoResponseStream = photoRequest.GetResponse().GetResponseStream())
                {
                    StreamReader sr = new StreamReader(sbPhotoResponseStream);

                    string data = sr.ReadToEnd();

                    photoResp = JsonConvert.DeserializeObject<PhotoResponse>(data);
                }

                Console.WriteLine("Pushing photo to SAS Url: " + photoResp.sasUrl);
                WebRequest putPhotoRequest = WebRequest.Create(photoResp.sasUrl);
                putPhotoRequest.Method = "PUT";
                putPhotoRequest.Headers.Add("x-ms-blob-type", "BlockBlob");
                using (var photoStream = GetPhoto())
                using (var reqStream = putPhotoRequest.GetRequestStream())
                {
                    Console.WriteLine("Writing photo to blob...");
                    photoStream.CopyTo(reqStream);
                }

                using (putPhotoRequest.GetResponse())
                {

                }

                Console.WriteLine("Sending notification to service bus queue");
                WebRequest sbRequest = WebRequest.Create("https://dpeproject.servicebus.Windows.net/arduino/messages");
                var headers = sbRequest.Headers;
                sbRequest.Method = "POST";
                using (var sbMessageStream = sbRequest.GetRequestStream())
                {
                    string body = JsonConvert.SerializeObject(new DoorBellNotification()
                    {
                        doorBellID = deviceID,
                        imageId = photoResp.photoId
                    });
                    var bytes = GetBytes(body);
                    sbMessageStream.Write(bytes, 0, bytes.Length);
                    headers.Add("Authorization", "WRAP access_token=\"" + wrapToken + "\"");
                }

                try
                {
                    Console.WriteLine("Sending door bell notification for " + deviceID);
                    using (var response = sbRequest.GetResponse())
                    {
                        Console.WriteLine("Sucessfully Sent");
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine("Couldn't post to service bus -" + e);
                }
        }

        static byte[] GetBytes(string str)
        {

            return Encoding.ASCII.GetBytes(str);
        }

        static Stream GetPhoto()
        {
#if LINUX
            //TODO: Replace this with our Raspberry Pi Camera
            Process raspistill = new Process();
            raspistill.StartInfo = new ProcessStartInfo("/usr/bin/raspistill", "-n -q " + photoQuality + " -o /home/pi/Desktop/me.jpg -h 200 -w 200 -t 500")
            {
                UseShellExecute = false
            };

            raspistill.Start();
            raspistill.WaitForExit();

            FileStream fs = new FileStream(@"/home/pi/Desktop/me.jpg", FileMode.Open);
#else
            FileStream fs = new FileStream(@"2ca1fc68-8293-4ff5-9aac-20e6bfc65fc7.jpg", FileMode.Open);
#endif
            return fs;
        }
    }

    public class DoorBellNotification
    {
        public string doorBellID { get; set; }
        public string imageId { get; set; }
    }
    
    public class PhotoResponse
    {
        public string sasUrl { get; set; }
        public string photoId { get; set; }
    }

}
