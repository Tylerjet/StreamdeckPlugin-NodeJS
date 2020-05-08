const minimist = require('minimist'),
WebSocket = require('ws'),
moment = require('moment'),
fs = require('fs');

//Get command line arguments and convert "-"" to "--"
//TODO:Make a module that does this elsewhere just to cleanup the file
let argv = [];
for (var c = 0; c < process.argv.length; c++) {
	if (process.argv[c].includes('-')) {
		process.argv[c] = ('-'+process.argv[c])
		argv.push(process.argv[c]);
	} else {argv.push(process.argv[c])}
}
//create array that you can call by the args name ex.) --port 1234 becomes args.port which returns 1234
let args = minimist(argv.slice(2));

//Assign args to variables, Obviously
let Port = args.port,
PluginUUID = args.pluginUUID,
RegisterEvent = args.registerEvent,
Info = args.Info;

//Calls the Function that i assume is usally called when linking to a JS file to connect the application to the stremdeck app.
connectElgatoStreamDeckSocket(Port, PluginUUID, RegisterEvent, Info);

function connectElgatoStreamDeckSocket(inPort, inPluginUUID, inRegisterEvent, inInfo) {
    // Open the web socket
   let websocket = new WebSocket("ws://localhost:" + inPort);

    websocket.onopen = function()
    {
        // WebSocket is connected, register the plugin
        const json = {
            "event": inRegisterEvent,
            "uuid": inPluginUUID
        };
    
        websocket.send(JSON.stringify(json));
        writeToLog("Websocket Connected");
    };

    websocket.onmessage = function (evt)
    {
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

        		writeToLog(jsonObj['event'])
        	break;

        	case "keyUp":
        		writeToLog(jsonObj['event'])
        	break;

        	case "willAppear":
        		writeToLog(jsonObj['event'])
        	break;

        	case "willDisappear":
        		writeToLog(jsonObj['event'])
        	break;

        	case "titleParametersDidChange":
        		writeToLog(jsonObj['event'])
        	break;

        	case "deviceDidConnect":
        		writeToLog(jsonObj['event'])
        	break;

        	case "deviceDidDisconnect":
        		writeToLog(jsonObj['event'])
        	break;
        }
	}
};

//Write data to log.
function writeToLog(data) {
	fs.appendFile("log.txt", (moment().format('M/D/YYYY-h:mm:ss: ') + data) +"\n", (err) => {
		if (err) {console.log(err)};
		console.log("Log Saved!");
	})
}
//Catch Errors
process.on('uncaughtException', err => {
	writeToLog(err);
})