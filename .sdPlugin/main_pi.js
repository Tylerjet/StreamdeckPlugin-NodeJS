/* eslint-disable no-unused-vars */
let websocket = null;
let uuid = null;
let actionInfo = {};
const inInfo = {};
let settings = {};

function connectElgatoStreamDeckSocket(inPort, inUUID, inRegisterEvent, inInfo, inActionInfo) {
  uuid = inUUID;

  actionInfo = JSON.parse(inActionInfo); // cache the info
  inInfo = JSON.parse(inInfo);
  // eslint-disable-next-line no-undef
  websocket = new WebSocket('ws://127.0.0.1:' + inPort);

  settings = actionInfo.payload.settings;
  console.log(settings, actionInfo);
  // loadSettings();
  websocket.onopen = function () {
    const json = {
      event: inRegisterEvent,
      uuid: inUUID,
    };

    websocket.send(JSON.stringify(json));
  };

  websocket.onmessage = function (evt) {
    // Revieved Message from SD
    const jsonObj = JSON.parse(evt.data);
    const event = jsonObj.event;

    console.log(jsonObj);
  };

  websocket.onclose = function () {};
}
// const elementId = document.getElementById('');

/* const loadSettings = () => {
  // load settings if some are found
};

elementId.onchange = () => {
  console.log(device.value);
  setSettings(actionInfo.context, Settings Object here); // on update set new settings
}; */

// Util Functions

// set settings
function setSettings(context, settings) {
  console.log(context, settings);
  const json = {
    event: 'setSettings',
    context: uuid,
    payload: settings,
  };
  websocket.send(JSON.stringify(json));
}

// method to pass values to the plugin
function sendValueToPlugin(value, param) {
  if (websocket) {
    const json = {
      action: actionInfo.action,
      event: 'sendToPlugin',
      context: uuid,
      payload: {
        [param]: value,
      },
    };
    websocket.send(JSON.stringify(json));
  }
}
