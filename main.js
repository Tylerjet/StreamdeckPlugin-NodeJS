const minimist = require('minimist'),
WebSocket = require('ws'),
//Place to add and store functions to help the file look cleaner hopefully and cause i want to learn how exports worked
functions = require('./functions');

//Get command line arguments and convert "-" to "--"
functions.cliArgs()

//create array that you can call by the args name ex.) --port 1234 becomes args.port which returns 1234
let args = minimist(process.argv.slice(2));

//Assign args to variables, Obviously
//TODO: Validate Data, Though i don't think it would be needed since you would think 
//the streamdeck app would make sure what it is sending is correct

let Port = args.port,
PluginUUID = args.pluginUUID,
RegisterEvent = args.registerEvent,
Info = args.Info;

//Calls the Function that is usally called when linking to a JS file to connect the application to the stremdeck app.
connectElgatoStreamDeckSocket(Port, PluginUUID, RegisterEvent, Info);

function connectElgatoStreamDeckSocket(
    inPort, 
    inPluginUUID, 
    inRegisterEvent, 
    inInfo
) {
    // Open the web socket
   let websocket = new WebSocket("ws://localhost:" + inPort);

    websocket.onopen = function() => {
        // WebSocket is connected, register the plugin
        const json = {
            "event": inRegisterEvent,
            "uuid": inPluginUUID
        };
    
        websocket.send(JSON.stringify(json));
        functions.writeToLog("Websocket Connected");
    };

    websocket.onclose = (evt) => {
        writeToLog("Websocket Closed Reason: ",evt);
    }

    websocket.onerror = (evt) => {
        writeToLog("Websocket Error: ", evt, evt.data);
    }

    websocket.onmessage = (evt) => {
        // Received message from Stream Deck
        const jsonObj = JSON.parse(evt.data);
        //Log(JSON.stringify(jsonObj));

        switch (jsonObj['event']) {
            case "keyDown":
                const json = {
                    "event": "showOk",
                    "context": jsonObj.context
                };

                websocket.send(JSON.stringify(json));

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
        }
    }
};

//Catch Errors
process.on('uncaughtException', err => {
    functions.writeToLog(err);
})