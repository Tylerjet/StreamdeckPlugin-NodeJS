const minimist = require('minimist');
const WebSocket = require('ws');

// functions storage to help the file look cleaner and to easily add new functions if needed without making this file longer than nessacary.
// eslint-disable-next-line no-unused-vars
const { cliArgs, writeToLog, inPkg } = require('./functions');

// If you have a module that uses exe files Ex.) nircmd use this to extract it to the cwd, see README.md for more info on how to call/modify the call for these files so they can run properly.

// inPkg(__dirname + '\\node_modules', undefined, /\.exe$/);

// Convert "-" to "--" from process argv to make compatable with minimist
cliArgs();

// create array that you can call by the args name ex.) --port 1234 becomes args.port
const args = minimist(process.argv.slice(2));

/*
Assign args to variables, Obviously
TODO: Validate Data i guess (i see in many other streamdeck like sdks that they validate theinfo to make sure its in the correct format
but unless in the future elgato changes that the data should stay the same so im not sure if there is a real need for it :shrug:)
*/
const Port = args.port;
const PluginUUID = args.pluginUUID;
const RegisterEvent = args.registerEvent;
const Info = args.Info;

/* Insert any custom node module requires here */

/* Insert and custom functions here */

/*
Called by streamdeck when plugin is added to initiate the connection, same as building a js only version from here on out for the most part, besides the fact that
you can use almost any node module obviously
*/
connectElgatoStreamDeckSocket(Port, PluginUUID, RegisterEvent, Info);

function connectElgatoStreamDeckSocket(inPort, inPluginUUID, inRegisterEvent, inInfo) {
  // Open the web socket
  // Use websocket since i now learned localhost takes 300ms to resolve apparently
  const websocket = new WebSocket('ws://127.0.0.1:' + inPort);

  websocket.onopen = () => {
    // WebSocket is connected, register the plugin
    const json = {
      event: inRegisterEvent,
      uuid: inPluginUUID,
    };

    websocket.send(JSON.stringify(json));
    writeToLog('Websocket Connected');
  };

  websocket.onclose = (evt) => {
    writeToLog('Websocket Closed Reason: ', evt);
  };

  websocket.onerror = (evt) => {
    writeToLog('Websocket Error: ', evt, evt.data);
  };
  // Remove and keep what you need here just added most of what is emitted from the streamdeck at any given time from either and action or from clicking on the button in the software
  websocket.onmessage = (evt) => {
    // Received message from Stream Deck
    const jsonObj = JSON.parse(evt.data);
    const context = jsonObj.context;
    let settings = {};

    switch (jsonObj.event) {
      case 'keyDown': {
        const showOk = {
          event: 'showOk',
          context: context,
        };

        websocket.send(JSON.stringify(showOk));
        break;
      }

      case 'keyUp': {
        writeToLog(jsonObj.event);
        break;
      }

      case 'willAppear': {
        writeToLog(jsonObj.event);
        break;
      }

      case 'willDisappear': {
        writeToLog(jsonObj.event);
        break;
      }

      case 'titleParametersDidChange': {
        writeToLog(jsonObj.event);
        break;
      }

      case 'deviceDidConnect': {
        writeToLog(jsonObj.event);
        break;
      }

      case 'deviceDidDisconnect': {
        writeToLog(jsonObj.event);
        break;
      }

      case 'didReceiveSettings': {
        // eslint-disable-next-line no-unused-vars
        settings = jsonObj.payload.settings;
        writeToLog(jsonObj.event);
        break;
      }

      case 'didReceiveGlobalSettings': {
        writeToLog(jsonObj.event);
        break;
      }

      case 'propertyInspectorDidAppear': {
        writeToLog(jsonObj.event);
        break;
      }

      case 'propertyInspectorDidDisappear': {
        writeToLog(jsonObj.event);
        break;
      }

      case 'sendToPlugin': {
        writeToLog(jsonObj.event);
        break;
      }
    }
  };
}

// Catch Errors
process.on('uncaughtException', (err) => {
  writeToLog(err);
  console.log(err);
});
