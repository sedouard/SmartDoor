// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/loginscreen.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            GiftMeFacebookAuthenticate.onCompleted = function (suceeded, authToken) {
                WinJS.Navigation.navigate("/pages/hub/hub.html", authToken);
            };
            FacebookAuthenticate.launchFacebookWebAuth();
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in layout.
        }
    });
})();

var FacebookAuthenticate = (function () {
    function FacebookAuthenticate() {
    }
    FacebookAuthenticate.callbackFacebookWebAuth = function (result) {
        var url = result.responseData;
        var querystring = {};
        var accessTokPatter = new RegExp("#access_token=.*=");
        var results = accessTokPatter.exec(url);

        if (results.length <= 0) {
            return;
        }

        results[0] = results[0].replace("#access_token", "");
        results[0] = results[0].replace("=", "");

        var shortLivedToken = results[0];

        //Get the user id from facebook book
        $.ajax({
            type: "GET",
            url: "https://graph.facebook.com/me?access_token=" + shortLivedToken,
            data: "",
            cache: false,
            success: function (response) {
                //Now authenticate into 
                var id = response.id;
                $.post(g_BaseUri + '/api/authentication/authenticate', { FacebookId: id, AccessToken: shortLivedToken }, function (resp) {
                    if (resp.SessionToken) {
                        console.log(" authentication suceeded");
                        FacebookAuthenticate.onCompleted(true, resp.SessionToken);
                    } else {
                        console.log(" authentication failed, no session token provided");
                        FacebookAuthenticate.onCompleted(false, null);
                    }
                });
            },
            failure: function (response) {
                //TODO: Add some ui to show that the gift me auth failed
            }
        });
        var response = "Status returned by WebAuth broker: " + result.responseStatus + "\r\n";
        if (result.responseStatus == 2) {
            response += "Error returned: " + result.responseErrorDetail + "\r\n";
        }
    };

    FacebookAuthenticate.callbackFacebookWebAuthError = function (err) {
        var error = "Error returned by WebAuth broker. Error Number: " + err.number + " Error Message: " + err.message + "\r\n";
    };

    FacebookAuthenticate.launchFacebookWebAuth = function () {
        var facebookURL = "https://www.facebook.com/dialog/oauth?client_id=";
        var callbackURL = "https://www.facebook.com/connect/login_success.html";
        var scope = 'user_birthday, friends_birthday' + ', user_interests, friends_interests' + ', user_likes, friends_likes' + ', user_relationships, friends_relationships' + ', user_relationship_details, friends_relationship_details' + ', email, user_friends, friends_location';

        var clientID = "175469245988036";
        facebookURL += clientID + "&scope=publish_stream,publish_checkins,publish_actions,share_item&redirect_uri=" + encodeURIComponent(callbackURL) + "&scope=" + scope + "&display=popup&response_type=token";

        var startURI = new Windows.Foundation.Uri(facebookURL);
        var endURI = new Windows.Foundation.Uri(callbackURL);

        try {
            Windows.Security.Authentication.Web.WebAuthenticationBroker.authenticateAsync(Windows.Security.Authentication.Web.WebAuthenticationOptions.default, startURI, endURI).then(FacebookAuthenticate.callbackFacebookWebAuth, FacebookAuthenticate.callbackFacebookWebAuthError);
        } catch (err) {
            console.log(err.message);
            return;
        }
    };
    FacebookAuthenticate.s_facebookAppID = "175469245988036";
    return FacebookAuthenticate;
})();
