/* eslint-disable no-unused-vars */
let websocket = null;
let uuid = null;
let actionInfo = {};
// eslint-disable-next-line no-var
var inInfo = {};
let settings = {};

function connectElgatoStreamDeckSocket(inPort, inUUID, inRegisterEvent, inInfo, inActionInfo) {
  uuid = inUUID;

  actionInfo = JSON.parse(inActionInfo); // cache the info
  inInfo = JSON.parse(inInfo);
  // eslint-disable-next-line no-undef
  websocket = new WebSocket('ws://127.0.0.1:' + inPort);

  settings = actionInfo.payload.settings;
  console.log(settings, actionInfo);
  if (settings !== null && Object.prototype.hasOwnProperty.call(settings, 'PropertyHere')) {
    loadSettings();
  }

  websocket.onopen = function () {
    const json = {
      event: inRegisterEvent,
      uuid: inUUID,
    };

    websocket.send(JSON.stringify(json));
  };

  websocket.onmessage = function (evt) {
    const inputMessage = document.getElementById('Message');

    const jsonObj = JSON.parse(evt.data);
    const event = jsonObj.event;
    /* 
    if (getPropFromString(jsonObj, 'payload.Message')) {
      inputMessage.value = jsonObj.payload.Message;
    } */
    console.log(jsonObj);
  };

  websocket.onclose = function () {};
}

const loadSettings = () => {
  // load settings if some are found
  // Set any document values etc. when the property inspector is loaded
};

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
// our method to pass values to the plugin
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
