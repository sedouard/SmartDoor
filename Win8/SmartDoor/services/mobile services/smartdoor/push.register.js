// http://go.microsoft.com/fwlink/?LinkID=290993&clcid=0x409
(function () {
    "use strict";

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    app.addEventListener("activated", function (args) {
        if (args.detail.kind == activation.ActivationKind.launch) {
            var packageToken = Windows.System.Profile.HardwareIdentification.getPackageSpecificToken(null);
            var installationId = Windows.Security.Cryptography.CryptographicBuffer.encodeToBase64String(packageToken.id);

            Windows.Networking.PushNotifications.PushNotificationChannelManager.createPushNotificationChannelForApplicationAsync().done(function (channel) {
                smartdoorClient.getTable("channels").insert({
                    channelUri: channel.uri,
                    installationId: installationId
                }).done(
                    function(inserted) {

                    },
                    function (error) {

                    });
            });
        }
    });
})();