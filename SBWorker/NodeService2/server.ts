///<reference path="typings/node.d.ts"/>
///<reference path="typings/jquery.d.ts"/>
///<reference path="typings/node-fibers.d.ts"/>
///<reference path="typings/azure.d.ts"/>
///<reference path="typings/nconf.d.ts"/>
import azure = require('azure');
import Fiber = require('fibers');
import Future = require('fibers/future');

var serviceBusUrl: string = "dpeproject.servicebus.Windows.net/arduino/messages";
var serviceBusAcsUrl: string = "dpeproject-sb.accesscontrol.windows.net";
var wrapPassword: string = "Qk1wJb5uMYKdtbUa637NPI6SDnpYAOT6ee9AI0TGHpU=";
var sb: azure.ServiceBusService;
/**
Fiber(function () {
    console.log('wait... ' + new Date);
    sleep(1000);
    console.log('ok... ' + new Date);
}).run();
**/
azure.RoleEnvironment.getConfigurationSettings((error, settings) => {
    if (error) {
        return;
    }
    else {
        sb = azure.createServiceBusService(settings["FrontDoor.ServiceBus.ConnectionString"]);
        var receieveQueueMessage = Future.wrap(sb.receiveQueueMessage);
        Fiber(function () {
            while (true) {
                console.log("waiting for sb message");
                //receieveQueueMessage((settings["FrontDoor.ServiceBus.IncomingNotificationQueue"]), { timeoutIntervalInS: 90 }).wait();
            }
        }).run();
        
    }
});
function sleep(ms) {
    var fiber = Fiber.current;
    setTimeout(function () {
        fiber.run();
    }, ms);
    Fiber.yield();
}


console.log('back in main');





