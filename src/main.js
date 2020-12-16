const minimist = require('minimist');
const WebSocket = require('ws');

// functions storage to help the file look just a bit cleaner and to easily add new functions if needed without making this file longer than nessacary.
// eslint-disable-next-line no-unused-vars
const { cliArgs, writeToLog, inPkg } = require('./functions');

// Convert "-" to "--" from process argv to make them compatable with minimist
cliArgs();

// create array that you can call by the args name ex.) --port becomes args.port
const args = minimist(process.argv.slice(2));

/*
Assign args to the proper variables, Obviously
TODO: Validate Data i guess (i see in many other streamdeck like sdks that they validate the info to make sure its in the correct format
but unless in the future elgato changes that the data should stay the same since the data comes cmd paramaters so im not sure if there is a real need for it :shrug:)
*/
const Port = args.port;
const PluginUUID = args.pluginUUID;
const RegisterEvent = args.registerEvent;
const Info = args.Info;

// If you have a module that uses exe files Ex.) nircmd use this to extract it to the cwd, see README.md for more info on how to call/modify the call for these files so they can run properly.
// inPkg(__dirname + '\\node_modules', undefined, /\.exe$/);

/* Insert any custom node module requires here */

/* Insert any custom functions here */

/*
Usally Called by SD when plugin is added to initiate the connection, 
but because this will be in exe form we must call the function ourselves since SD cannot,
same as building a js plugin from here on out for the most part, besides the fact that you can use almost any node module obviously
*/
connectElgatoStreamDeckSocket(Port, PluginUUID, RegisterEvent, Info);

function connectElgatoStreamDeckSocket(inPort, inPluginUUID, inRegisterEvent, inInfo) {
  // Open the web socket
  // Use 127.0.0.1 since i now learned localhost takes 300ms to resolve apparently
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
  websocket.onmessage = (evt) => {
    // Received message from Stream Deck
    const jsonObj = JSON.parse(evt.data);
    const context = jsonObj.context;
    let settings = jsonObj.payload?.settings === undefined ? {} : jsonObj.payload.settings; // If there are settings then use them, if not define that an obj is expected

    switch (jsonObj.event) {
      case 'keyDown': {
        const showOk = {
          event: 'showOk',
          context: context,
        };

        websocket.send(JSON.stringify(showOk));
        writeToLog(JSON.stringify(jsonObj));
        break;
      }
      /*
      Remove and keep what you need here just added most of what is emitted from the streamdeck at any given time from either an action or from clicking on the button in the software
      recieved events documentation can be found at: https://developer.elgato.com/documentation/stream-deck/sdk/events-received/
      and events you can send at: https://developer.elgato.com/documentation/stream-deck/sdk/events-sent/
      */
      case 'keyUp': {
        writeToLog(JSON.stringify(jsonObj));
        break;
      }

      case 'willAppear': {
        writeToLog(JSON.stringify(jsonObj));
        break;
      }

      case 'willDisappear': {
        writeToLog(JSON.stringify(jsonObj));
        break;
      }

      case 'titleParametersDidChange': {
        writeToLog(JSON.stringify(jsonObj));
        break;
      }

      case 'deviceDidConnect': {
        writeToLog(JSON.stringify(jsonObj));
        break;
      }

      case 'deviceDidDisconnect': {
        writeToLog(JSON.stringify(jsonObj));
        break;
      }

      case 'didReceiveSettings': {
        // eslint-disable-next-line no-unused-vars
        settings = jsonObj.payload.settings;
        writeToLog(JSON.stringify(jsonObj));
        break;
      }

      case 'didReceiveGlobalSettings': {
        writeToLog(JSON.stringify(jsonObj));
        break;
      }

      case 'propertyInspectorDidAppear': {
        writeToLog(JSON.stringify(jsonObj));
        break;
      }

      case 'propertyInspectorDidDisappear': {
        writeToLog(JSON.stringify(jsonObj));
        break;
      }

      case 'sendToPlugin': {
        writeToLog(JSON.stringify(jsonObj));
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
