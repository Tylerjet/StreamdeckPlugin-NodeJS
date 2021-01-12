/* eslint-disable no-unused-vars */
const minimist = require('minimist');
const WebSocket = require('ws');

// functions storage to help the file look just a bit cleaner and to easily add new functions if needed without making this file longer than it would already be.
const { cliArgs, writeToLog } = require('./functions');

// Convert "-" to "--" from process argv to make them compatable with minimist
cliArgs();

// create array that you can call by the args name ex.) --port becomes args.port
const args = minimist(process.argv.slice(2));

/*
Assign args to the proper variables, Obviously
TODO: Validate Data i guess (i see in many other validate the info to make sure its in the correct format
but unless in the future elgato changes the command line arguments then the format should stay the same :shrug:)
*/
const Port = args.port;
const PluginUUID = args.pluginUUID;
const RegisterEvent = args.registerEvent;
const Info = args.Info;
const SDEMU = args.SDEMU !== undefined ? args.SDEMU : false; // Checks for this argument that is sent specifically by the streamdeck emulator when running tests

// If you have a module that uses exe files ( Ex.) nircmd.exe), Then use this to extract it to the cwd, see README.md for more info on how to call/modify the call for these files so they can run properly.
/* 
const inPkg = require('findFilesInPkg');
const path = require('path');
inPkg(path.join(__dirname, 'node_modules'), undefined, /\.exe$/); 
*/

/* Insert any custom node module requires here */

/* Insert any custom functions here */

/*
Because this is not a true JS only plugin like the elgato examples we call the function manually to initiate the SD connection,
the rest is done just like a JS plugin with the addition that you can include node modules.
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
    SDEMU === true
      ? console.log('Connected to Streamdeck Emulator Websocket')
      : writeToLog('Websocket Connected');
  };

  websocket.onclose = (evt) => {
    SDEMU === true
      ? console.log('Websocket Closed Reason: ', evt.reason)
      : writeToLog('Websocket Closed Reason: ', JSON.stringify(evt.reason));
  };

  websocket.onerror = (evt) => {
    SDEMU === true
      ? console.log('Websocket Error: ', evt, evt.data)
      : writeToLog('Websocket Error: ', JSON.stringify(evt), JSON.stringify(evt.data));
  };
  websocket.onmessage = (evt) => {
    // Received message from Stream Deck
    const jsonObj = JSON.parse(evt.data);
    const context = jsonObj.context;
    const action = jsonObj.action;
    const settings = jsonObj.payload?.settings === undefined ? {} : jsonObj.payload.settings; // If there are settings then use them, if not define that an obj is expected

    switch (jsonObj.event) {
      case 'keyDown': {
        // Only log if not in the SD Emulator since it will already show the response there
        if (SDEMU !== true) {
          writeToLog(JSON.stringify(jsonObj));
        }
        break;
      }
      case 'keyUp': {
        const showOk = {
          event: 'showOk',
          context: context,
        };

        websocket.send(JSON.stringify(showOk));

        if (SDEMU !== true) {
          writeToLog(JSON.stringify(jsonObj));
        }
        break;
      }
      /*
      Remove and keep what you need here. *just added most of what is emitted from the streamdeck at any given time from either pressing a key, clicking on a key in the app or adding/removing a key from the software
      recieved events documentation can be found at: https://developer.elgato.com/documentation/stream-deck/sdk/events-received/
      and events you can send at: https://developer.elgato.com/documentation/stream-deck/sdk/events-sent/
      */
      case 'willAppear': {
        if (SDEMU !== true) {
          writeToLog(JSON.stringify(jsonObj));
        }
        break;
      }

      case 'willDisappear': {
        if (SDEMU !== true) {
          writeToLog(JSON.stringify(jsonObj));
        }
        break;
      }

      case 'titleParametersDidChange': {
        if (SDEMU !== true) {
          writeToLog(JSON.stringify(jsonObj));
        }
        break;
      }

      case 'deviceDidConnect': {
        if (SDEMU !== true) {
          writeToLog(JSON.stringify(jsonObj));
        }
        break;
      }

      case 'deviceDidDisconnect': {
        if (SDEMU !== true) {
          writeToLog(JSON.stringify(jsonObj));
        }
        break;
      }

      case 'didReceiveSettings': {
        if (SDEMU !== true) {
          writeToLog(JSON.stringify(jsonObj));
        }
        break;
      }

      case 'didReceiveGlobalSettings': {
        if (SDEMU !== true) {
          writeToLog(JSON.stringify(jsonObj));
        }
        break;
      }

      case 'propertyInspectorDidAppear': {
        if (SDEMU !== true) {
          writeToLog(JSON.stringify(jsonObj));
        }
        break;
      }

      case 'propertyInspectorDidDisappear': {
        if (SDEMU !== true) {
          writeToLog(JSON.stringify(jsonObj));
        }
        break;
      }

      case 'sendToPlugin': {
        if (SDEMU !== true) {
          writeToLog(JSON.stringify(jsonObj));
        }
        break;
      }
    }
  };
}

// Catch Errors
process.on('uncaughtException', (err) => {
  SDEMU === true ? console.log(err) : writeToLog(err);
  console.log(err);
});
