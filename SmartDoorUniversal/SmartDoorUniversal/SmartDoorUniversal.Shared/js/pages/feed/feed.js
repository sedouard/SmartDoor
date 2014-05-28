(function () {
    "use strict";

    function onPush(data) {
        var roamingSettings = g_applicationData.roamingSettings;
        refreshFeed(roamingSettings.values["doorbellId"]);
    };

    function refreshFeed(id, feed) {
        var miliSeconds = new Date().getTime();
        g_smartdoorClient.invokeApi('photos', {
            method: 'GET',
            parameters: {
                doorBellID: id,
                //The invokeApi api has a caching behavior. If we make the requests
                //unqiue we will force the mobile services client lib to get fresh data
                dummyTime: miliSeconds
            }
        }).done(function (data) {

            

            var listView = $("#ui_activityFeed")[0].winControl;
            listView.addEventListener("iteminvoked", function (evt) {
                var index = evt.detail.itemIndex;
                var albums = new Array();

                //get profile photos for user
                var feedItem = feed.getItem(index).data;

                WinJS.Navigation.navigate('/pages/person/person.html', feedItem);
            });

            for (var i = data.result.length-1; i >= 0; i--) {
                var time = data.result[i].timestamp;
                var date = new Date(parseInt(time));
                var currentTime = new Date();

                //Show relative times
                if (currentTime.getYear() == date.getYear() && currentTime.getMonth() == date.getMonth() &&
                    currentTime.getDate() == date.getDate() && currentTime.getHours() == date.getHours() &&
                    currentTime.getSeconds() == date.getSeconds()) {

                    data.result[i].time = 'just now';

                }
                else if (currentTime.getYear() == date.getYear() && currentTime.getMonth() == date.getMonth() &&
                    currentTime.getDate() == date.getDate() && currentTime.getHours() == date.getHours() &&
                    currentTime.getMinutes() == date.getMinutes()) {

                    var delta = currentTime.getSeconds() - date.getSeconds();

                    data.result[i].time = delta + ' seconds ago';

                }
                else if (currentTime.getYear() == date.getYear() && currentTime.getMonth() == date.getMonth() &&
                    currentTime.getDate() == date.getDate() && currentTime.getHours() == date.getHours()) {

                    var delta = currentTime.getMinutes() - date.getMinutes();

                    data.result[i].time = delta + ' minutes ago';

                }
                else if (currentTime.getYear() == date.getYear() && currentTime.getMonth() == date.getMonth() &&
                    currentTime.getDate() == date.getDate()) {

                    var delta = currentTime.getHours() - date.getHours();

                    data.result[i].time = delta + ' hours ago';

                }
                else if (currentTime.getYear() == date.getYear() && currentTime.getMonth() == date.getMonth()) {

                    var delta = currentTime.getDate() - date.getDate();

                    data.result[i].time = delta + ' days ago';

                }
                else if (currentTime.getYear() == date.getYear()) {

                    var delta = currentTime.getMonth() - date.getMonth();

                    data.result[i].time = delta + ' months ago';

                }
                else {

                    var delta = currentTime.getMonth() - date.getMonth();

                    data.result[i].time = delta + ' years ago';

                }
                if (!data.result[i].identifiedPerson) {
                    data.result[i].identifiedPerson = { name: "" };
                }
                feed.push(data.result[i]);
            }

        }, function (error) {
            //TODO: Show in UI we couldn't get the data
            console.error('Unexpected error: Failed to look up photos for this doorbell: ' + error)

        });
    }

    WinJS.UI.Pages.define("/pages/feed/feed.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        init: function(element, options){
            g_DoorBellFeed = new WinJS.Binding.List();
        },
        ready: function (element, options) {
            $("#sideMenu").show();
            
            var roamingSettings = g_applicationData.roamingSettings;
            g_UpdatePushNotificationForDoorBell(roamingSettings.values["doorbellId"], roamingSettings.values["userid"], onPush);

            refreshFeed(roamingSettings.values["doorbellId"], g_DoorBellFeed);
            

            
            //Get the photos for doorbell

            // TODO: Initialize the page here.
        }
    });
})();
