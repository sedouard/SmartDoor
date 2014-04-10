// http://go.microsoft.com/fwlink/?LinkID=290993&clcid=0x409
var g_smartdoorClient = new WindowsAzure.MobileServiceClient(
                "https://smartdoor.azure-mobile.net/",
                "HnAxDFiMSQATHNaCcgIpEllAhenguj14");
var g_authToken;
var g_userId;
var g_applicationData = Windows.Storage.ApplicationData.current;

function g_UpdatePushNotificationForDoorBell(doorBellID, onPushNotification) {
    var packageToken = Windows.System.Profile.HardwareIdentification.getPackageSpecificToken(null);
    var installationId = Windows.Security.Cryptography.CryptographicBuffer.encodeToBase64String(packageToken.id);

    Windows.Networking.PushNotifications.PushNotificationChannelManager.createPushNotificationChannelForApplicationAsync().done(function (channel) {
        //generate the unique ID of this device, we'll use it for device ID
        var packageToken = Windows.System.Profile.HardwareIdentification.getPackageSpecificToken(null);
        var installationId = Windows.Security.Cryptography.CryptographicBuffer.encodeToBase64String(packageToken.id);
        
        //register handler
        if(onPushNotification){
            channel.addEventListener("pushnotificationreceived", onPushNotification, false);
        }

        var regObject = {
            doorBellID: doorBellID,
            users: [
                {
                    id: g_userId,
                    mobileDevices: [
                        {
                            deviceId: installationId,
                            channel: channel.uri
                        }
                    ]
                }
            ]
        }
        var tags = new Array();

        //Register this device for the logged in user to the notification hub
        tags.push(g_userId);

        //Register this device for the currently subscribed door bell
        tags.push(doorBellID);

        //send the registration request to our hub via mobile services
        g_smartdoorClient.push.registerNative(channel.uri, tags).done(function (result) {
            console.log('Registered for push notifications')
        }, function (error) {
            console.error('Could not register for push notifications: ' + error);
        });

        return g_smartdoorClient.invokeApi('register', {
            body: regObject,
            method: 'POST',
        }).done(function (result) {
            console.log(result);
        });
        
    });
}