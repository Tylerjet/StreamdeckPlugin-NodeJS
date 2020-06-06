const minimist = require('minimist'),
WebSocket = require('ws'),
//Place to store functions to help the file look cleaner.
functions = require('./functions');

//Convert "-" to "--" from process argv to make compatable with minimist
functions.cliArgs()

//create array that you can call by the args name ex.) --port 1234 becomes args.port
let args = minimist(process.argv.slice(2));

//Assign args to variables, Obviously
//TODO: Validate Data i guess

let Port = args.port,
PluginUUID = args.pluginUUID,
RegisterEvent = args.registerEvent,
Info = args.Info;

//Calls the Function that is usally called when linking to a JS file from the app.
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
})