// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
var g_FacebookClientId = "1403252139945261";
(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/login/loginscreen.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {

            $("#ui_FacebookIcon").click(function (evt) {

                g_smartdoorClient.login('facebook', true).done(function (result) {
                    if(!result){
                        console.error('Could not sign in ' + result);
                    }
                    g_authToken = result.mobileServiceAuthenticationToken;
                    g_userId = result.userId;

                    var roamingSettings = g_applicationData.roamingSettings;

                    if (!roamingSettings.values["doorbellId"]) {
                        WinJS.Navigation.navigate("/pages/doorCodeEnter/doorCodeEnter.html");
                    }
                    else {
                        //TODO: Navigate to 'feed' page.
                        WinJS.Navigation.navigate("/pages/feed/feed.html");
                    }
                });
            });

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
            FacebookAuthenticate.onCompleted(false, 'Unexpected access token response from FB');;
        }

        results[0] = results[0].replace("#access_token", "");
        results[0] = results[0].replace("=", "");

        var shortLivedToken = results[0];

        FacebookAuthenticate.onCompleted(true, shortLivedToken);;

    };

    FacebookAuthenticate.callbackFacebookWebAuthError = function (err) {
        var error = "Error returned by WebAuth broker. Error Number: " + err.number + " Error Message: " + err.message + "\r\n";
    };

    FacebookAuthenticate.launchFacebookWebAuth = function (clientId) {
        var facebookURL = "https://www.facebook.com/dialog/oauth?client_id=";
        var callbackURL = "https://www.facebook.com/connect/login_success.html";
        var scope = 'basic_info';


        facebookURL += clientId + "&scope=basic_info&redirect_uri=" + encodeURIComponent(callbackURL) + "&display=popup&response_type=token";

        var startURI = new Windows.Foundation.Uri(facebookURL);
        var endURI = new Windows.Foundation.Uri(callbackURL);

        try {
            Windows.Security.Authentication.Web.WebAuthenticationBroker.authenticateAsync(Windows.Security.Authentication.Web.WebAuthenticationOptions.default, startURI, endURI).then(FacebookAuthenticate.callbackFacebookWebAuth, FacebookAuthenticate.callbackFacebookWebAuthError);
        } catch (err) {
            console.log(err.message);
            return;
        }
    };
    return FacebookAuthenticate;
})();
