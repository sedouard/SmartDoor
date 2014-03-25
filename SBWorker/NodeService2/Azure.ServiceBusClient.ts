///<reference path="typings/node.d.ts"/>
///<reference path="typings/azure.d.ts"/>
import https = require('https');
import azure = require('azure');
export class ServiceBusClient {
    private _serviceBusUrl: string;
    private _serviceBusAcsUrl: string;
    private _wrapPassword: string;
    private _accessToken: string;
    private _acccessTokenExpirationMiliSecs: number;
    private _lastInitTimeSecs: number;

    public constructor(serviceBusUrl: string, serviceBusAcsUrl: string,
        wrapPassword: string) {

        this._serviceBusUrl = serviceBusUrl;
        this._serviceBusAcsUrl = serviceBusAcsUrl;
        this._wrapPassword = wrapPassword;
    }

    private tokenIsExpriedOrInvalid(): boolean {
        if (this._accessToken == null) {
            return true;
        }
        var timeSecs = new Date().getSeconds();

        if (timeSecs < this._lastInitTimeSecs + this._acccessTokenExpirationMiliSecs) {
            return true;
        }
        else {
            return false;
        }
    }

    public ReadNextMessage(timeout: number, callback: (succeeded: boolean, message: string) => void) {
        if (this.tokenIsExpriedOrInvalid) {
            this.aquireAccessToken(function (success: boolean, token: string) {
                if (!success) {
                    //Token is error message if success == false
                    callback(success, "Could not read message");
                }
                else {
                    this._acccessToken = token;
                    callback(success, "Mock message TODO Impl reading sb");
                }
            });
        }
    }

    private ReadNextMessageFromQueue(queueName: string, callback: (boolean, string) => void) {


        //https - port 443
        var options: https.RequestOptions = {
            hostname: this._serviceBusUrl,
            path: "/" + queueName + "/messages",
            port: 443
        };

        var req = https.get(options, function (res) {

            res.on('data', function (chunk) {
                callback(true, chunk);
            });
        });

        req.on('error', function (e) {
            callback(false, e);
        });

    }

    //Gets access token from default service bus ACS authentication service.
    private aquireAccessToken(callback: (boolean, string) => void): void {
        //https - port 443
        var options: https.RequestOptions = {
            hostname: this._serviceBusAcsUrl,
            path: "/WRAPv0.9",
            method: "POST",
            port: 443
        };

        
        var req = https.request(options, function (resp) {
            resp.on('data', function (chunk) {
                var wrapRaw: string = decodeURIComponent(chunk);
                this._lastInitTimeSecs = new Date().getTime();
                this._acccessTokenExpirationMiliSecs = wrapRaw.split("&wrap_access_token_expires_in=")[1];
                this._acccessTokenExpirationMiliSecs *= 1000;
                wrapRaw = wrapRaw.split("&wrap_access_token_expires_in")[0];
                var wrapToken = wrapRaw.replace("wrap_access_token=", "");
                var success = wrapToken != null;

                callback(success, wrapToken);

            });
        });
        req.on('error', function (e) {
            callback(false, e);
        });
        var body: string = encodeURIComponent(this._wrapPassword) + "&wrap_scope=" + encodeURIComponent("http://" + this._serviceBusUrl);
        body = "wrap_name=owner&wrap_password=" + body;
        req.write(body);
        req.end();
    }
}