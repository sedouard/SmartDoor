// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511

(function () {
    "use strict";
    
    WinJS.UI.Pages.define("/pages/login/loginscreen.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            // TODO: Initialize the page here.
            console.log("Initialized login screen!");
            $("#ui_FacebookIcon").click(function (evt) {
                g_smartdoorClient.login("facebook").done(function (results) {
                    g_authToken = results.mobileServiceAuthenticationToken;
                    g_userId = results.userId;
                    WinJS.Navigation.navigate("/pages/doorCodeEnter/doorCodeEnter.html");
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

        
        facebookURL += clientId + "&scope=publish_stream,publish_checkins,publish_actions,share_item&redirect_uri=" + encodeURIComponent(callbackURL) + "&scope=" + scope + "&display=popup&response_type=token";

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
