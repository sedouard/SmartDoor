// http://go.microsoft.com/fwlink/?LinkID=290993&clcid=0x409
var g_smartdoorClient = new WindowsAzure.MobileServiceClient(
                "https://smartdoor.azure-mobile.net/",
                "HnAxDFiMSQATHNaCcgIpEllAhenguj14");
var g_authToken;
var g_userId;
var g_applicationData = Windows.Storage.ApplicationData.current;