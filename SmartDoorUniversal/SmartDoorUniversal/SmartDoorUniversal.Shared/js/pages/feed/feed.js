(function () {
    "use strict";

    function onPush(data) {
        var roamingSettings = g_applicationData.roamingSettings;
        refreshFeed(roamingSettings.values["doorbellId"]);
    };

    function refreshFeed(id) {
        g_smartdoorClient.invokeApi('photos', {
            method: 'GET',
            parameters: {
                doorBellID: id
            }
        }).done(function (data) {

            //clear current feed
            for (var i in g_DoorBellFeed) {
                g_DoorBellFeed.pop();
            }

            for (var i = data.result.length-1; i >= 0; i--) {
                var time = data.result[i].timestamp;
                var date = new Date(parseInt(time));
                var currentTime = new Date();

                //Show relative times
                if (currentTime.getYear() == date.getYear() && currentTime.getMonth() == date.getMonth() &&
                    currentTime.getDay() == date.getDay() && currentTime.getHours() == date.getHours() &&
                    currentTime.getSeconds() == date.getSeconds()) {

                    data.result[i].time = 'just now';

                }
                else if (currentTime.getYear() == date.getYear() && currentTime.getMonth() == date.getMonth() &&
                    currentTime.getDay() == date.getDay() && currentTime.getHours() == date.getHours() &&
                    currentTime.getMinutes() == date.getMinutes()) {

                    var delta = currentTime.getSeconds() - date.getSeconds();

                    data.result[i].time = delta + ' seconds ago';

                }
                else if (currentTime.getYear() == date.getYear() && currentTime.getMonth() == date.getMonth() &&
                    currentTime.getDay() == date.getDay() && currentTime.getHours() == date.getHours()) {

                    var delta = currentTime.getMinutes() - date.getMinutes();

                    data.result[i].time = delta + ' minutes ago';

                }
                else if (currentTime.getYear() == date.getYear() && currentTime.getMonth() == date.getMonth() &&
                    currentTime.getDay() == date.getDay()) {

                    var delta = currentTime.getHours() - date.getHours();

                    data.result[i].time = delta + ' hours ago';

                }
                else if (currentTime.getYear() == date.getYear() && currentTime.getMonth() == date.getMonth()) {

                    var delta = currentTime.getDay() - date.getDay();

                    data.result[i].time = delta + ' days ago';

                }
                else if (currentTime.getYear() == date.getYear()) {

                    var delta = currentTime.getMonths() - date.getMonths();

                    data.result[i].time = delta + ' months ago';

                }
                else {

                    var delta = currentTime.getMonth() - date.getMonth();

                    data.result[i].time = delta + ' years ago';

                }
                g_DoorBellFeed.push(data.result[i]);
            }

        }, function (error) {
            //TODO: Show in UI we couldn't get the data
            console.error('Unexpected error: Failed to look up photos for this doorbell: ' + error)

        });
    }

    WinJS.UI.Pages.define("/pages/feed/feed.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.

        ready: function (element, options) {
            var roamingSettings = g_applicationData.roamingSettings;
            g_UpdatePushNotificationForDoorBell(roamingSettings.values["doorbellId"], onPush);

            refreshFeed(roamingSettings.values["doorbellId"]);
            //Get the photos for doorbell

            // TODO: Initialize the page here.
        }
    });
})();
