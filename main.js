const minimist = require('minimist'),
WebSocket = require('ws'),
//functions store to help the file look cleaner and to easily add new functions if needed
functions = require('./functions');

//Convert "-" to "--" from process argv to make compatable with minimist
functions.cliArgs()

//create array that you can call by the args name ex.) --port 1234 becomes args.port
let args = minimist(process.argv.slice(2));
/*
Assign args to variables, Obviously
TODO: Validate Data i guess (i see in many other streamdeck like sdks that they validate theinfo to make sure its in the correct format
but unless in the future elgato changes that the data should stay the same so im not sure if there is a real need for it :shrug:)
*/
let Port = args.port,
PluginUUID = args.pluginUUID,
RegisterEvent = args.registerEvent,
Info = args.Info;

/*
Called by streamdeck when plugin is added to initiate the connection, same as building a js only version from here on out for the most part, besides the fact that
you can use almost any node module obviously
*/
connectElgatoStreamDeckSocket(Port, PluginUUID, RegisterEvent, Info);

function connectElgatoStreamDeckSocket(inPort, inPluginUUID, inRegisterEvent, inInfo) {
    // Open the web socket
   let websocket = new WebSocket("ws://localhost:" + inPort);

    websocket.onopen = () => {
        // WebSocket is connected, register the plugin
        const json = {
            "event": inRegisterEvent,
            "uuid": inPluginUUID
        };
    
        websocket.send(JSON.stringify(json));
        functions.writeToLog("Websocket Connected");
    };

    websocket.onclose = (evt) => {
        functions.writeToLog("Websocket Closed Reason: ",evt);
    }

    websocket.onerror = (evt) => {
        functions.writeToLog("Websocket Error: ", evt, evt.data);
    }
//Remove and keep what you need here just added most of what is emitted from the streamdeck at any given time from either and action or from clicking on the button in the software
    websocket.onmessage = (evt) => {
        // Received message from Stream Deck
        const jsonObj = JSON.parse(evt.data);
        let context = jsonObj.context

        switch (jsonObj['event']) {
            case "keyDown":
                const showOk = {
                    "event": "showOk",
                    "context": context
                };

                websocket.send(JSON.stringify(showOk));
                functions.writeToLog(jsonObj['event'])
            break;

            case "keyUp":
                functions.writeToLog(jsonObj['event'])
            break;

            case "willAppear":
                functions.writeToLog(jsonObj['event'])
            break;

            case "willDisappear":
                functions.writeToLog(jsonObj['event'])
            break;

            case "titleParametersDidChange":
                functions.writeToLog(jsonObj['event'])
            break;

            case "deviceDidConnect":
                functions.writeToLog(jsonObj['event'])
            break;

            case "deviceDidDisconnect":
                functions.writeToLog(jsonObj['event'])
            break;

            case "didReceiveSettings":
                functions.writeToLog(jsonObj['event'])
            break;

            case "didReceiveGlobalSettings":
                functions.writeToLog(jsonObj['event'])
            break;

            case "propertyInspectorDidAppear":
                functions.writeToLog(jsonObj['event'])
            break;

            case "propertyInspectorDidDisappear":
                functions.writeToLog(jsonObj['event'])
            break;

            case "sendToPlugin":
                functions.writeToLog(jsonObj['event'])
            break;
        }
    }
};

//Catch Errors
process.on('uncaughtException', err => {
    functions.writeToLog(err);
    console.log(err)
})