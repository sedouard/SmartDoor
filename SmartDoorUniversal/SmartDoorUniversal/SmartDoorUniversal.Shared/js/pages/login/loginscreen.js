// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
var g_FacebookClientId = "1403252139945261";
var g_FacebookRootUrl = "https://graph.facebook.com/";
var g_ShortLivedFacebookAuthToken;
(function () {
    "use strict";
    Windows.ApplicationModel.c
    WinJS.UI.Pages.define("/pages/login/loginscreen.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {

            if (options && options.activationKind === Windows.ApplicationModel.Activation.ActivationKind.webAuthenticationBrokerContinuation) {

                continueWebAuthentication(options.activatedEventArgs);
            }
            $("#sideMenu").hide();
            //routine to sign in with facebook or to just use the stored auth token from ams
            var signIn = function (provider, token) {
                //this is not a single sign on attempt
                var authObj;
                var singleSignOn = false;
                if (provider) {
                    authObj = { access_token: token };
                }
                else {
                    authObj = token
                    singleSignOn = true;
                }

                g_smartdoorClient.login(provider, authObj, singleSignOn, function (error, result) {

                    if (!result) {
                        console.error('Could not sign in ' + result);
                        return;
                    }
                    g_smartdoorClient.invokeApi('longtermtoken', {
                        method: 'GET',
                        parameters: {
                            access_token: token
                        }
                    }, function (error, data) {
                        if (error) {
                            console.error(error);
                            return;
                        }
                        var roamingSettings = g_applicationData.roamingSettings;
                        roamingSettings.values["auth_token"] = data.result.access_token;
                        roamingSettings.values["userid"] = result.userId;
                        g_authToken = result.mobileServiceAuthenticationToken;
                        g_userId = result.userId;
                        g_ShortLivedFacebookAuthToken = token;



                        if (!roamingSettings.values["doorbellId"]) {
                            WinJS.Navigation.navigate("/pages/doorCodeEnter/doorCodeEnter.html");
                        }
                        else {
                            //TODO: Navigate to 'feed' page.
                            WinJS.Navigation.navigate("/pages/feed/feed.html");
                        }

                    });

                });
            }
            $("#ui_FacebookIcon").click(function (evt) {

                //do full login procedure
                FacebookAuthenticate.onCompleted = function (succeeded, shortLivedToken) {
                    if (succeeded) {
                        signIn('facebook', shortLivedToken);
                    }
                };
                FacebookAuthenticate.launchFacebookWebAuth(g_FacebookClientId);
                
            });

            //try to just sign in automatically
            var applicationData = Windows.Storage.ApplicationData.current;

            var roamingSettings = applicationData.roamingSettings;

            if (roamingSettings.values["auth_token"]) {

                signIn('facebook', roamingSettings.values["auth_token"]);
            }
        },

        unload: function () {
            // TODO: Respond to navigations away from this page.
            console.log('womp1');
        },

        updateLayout: function (element) {
            /// <param name="element" domElement="true" />
            console.log('womp2');
            // TODO: Respond to changes in layout.
        },

    });
})();

var FacebookAuthenticate = (function () {
    function FacebookAuthenticate() {
    }
    FacebookAuthenticate.callbackFacebookWebAuth = function (result) {
        var url = result.responseData;
        var querystring = {};
        var accessTokPatter = new RegExp("#access_token=.*&expires_in");
        var results = accessTokPatter.exec(url);

        if (results.length <= 0) {
            FacebookAuthenticate.onCompleted(false, 'Unexpected access token response from FB');;
        }

        results[0] = results[0].replace("#access_token", "");
        results[0] = results[0].replace("&expires_in", "");
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


        facebookURL += clientId + "&scope=basic_info,friends_photos,user_photos&redirect_uri=" + encodeURIComponent(callbackURL) + "&display=popup&response_type=token";

        var startURI = new Windows.Foundation.Uri(facebookURL);
        var endURI = new Windows.Foundation.Uri(callbackURL);

        try {
           
            Windows.Security.Authentication.Web.WebAuthenticationBroker.authenticateAsync(Windows.Security.Authentication.Web.WebAuthenticationOptions.default, startURI, endURI).then(FacebookAuthenticate.callbackFacebookWebAuth, FacebookAuthenticate.callbackFacebookWebAuthError);
        } catch (err) {
            //try windows phone api
            console.log(err.message);
            console.log("Trying authenticateAndContinue instead")
            Windows.Security.Authentication.Web.WebAuthenticationBroker.authenticateAndContinue(startURI, endURI);
            return;
        }
    };
    return FacebookAuthenticate;
})();
