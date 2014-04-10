﻿(function () {
    "use strict";

    var nav = WinJS.Navigation;
    var session = WinJS.Application.sessionState;
    var util = WinJS.Utilities;

    // Get the groups used by the data-bound sections of the Hub.
    var section3Group = Data.resolveGroupReference("group4");
    var section3Items = Data.getItemsFromGroup(section3Group);

    WinJS.UI.Pages.define("/pages/doorCodeEnter/doorCodeEnter.html", {
        processed: function (element) {
            return WinJS.Resources.processAll(element);
        },

        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {

            //Register this device

            $('#ui_registerButton').click(function (evt) {
				var packageToken = Windows.System.Profile.HardwareIdentification.getPackageSpecificToken(null);
				var installationId = Windows.Security.Cryptography.CryptographicBuffer.encodeToBase64String(packageToken.id);

				Windows.Networking.PushNotifications.PushNotificationChannelManager.createPushNotificationChannelForApplicationAsync().done(function (channel) {
				    //generate the unique ID of this device, we'll use it for device ID
				    var packageToken = Windows.System.Profile.HardwareIdentification.getPackageSpecificToken(null);
				    var installationId = Windows.Security.Cryptography.CryptographicBuffer.encodeToBase64String(packageToken.id);
				    var code = $('#ui_DoorCodeBox').val();
				    
				    var regObject = {
				        doorBellID: code,
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

				    g_smartdoorClient.invokeApi('register', {
				        body: regObject,
				        method: 'POST',
				    }).done(function (result) {
				        console.log('Sucessfully registered this mobile app user to doorbell device');
				        var roamingSettings = g_applicationData.roamingSettings;

                        //save this for later. The user shouldn't have to enter their doorbell all the time
				        roamingSettings.values["doorbellId"] = code;
				    });
				});
			});
            



        },

        section3DataSource: section3Items.dataSource,

        section3HeaderNavigate: util.markSupportedForProcessing(function (args) {
            nav.navigate("/pages/section/section.html", { title: args.detail.section.header, groupKey: section3Group.key });
        }),

        section3ItemNavigate: util.markSupportedForProcessing(function (args) {
            var item = Data.getItemReference(section3Items.getAt(args.detail.itemIndex));
            nav.navigate("/pages/item/item.html", { item: item });
        }),

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in layout.
        },
    });
})();