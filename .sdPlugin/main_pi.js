/* eslint-disable no-unused-vars */
let websocket = null;
let uuid = null;
let actionInfo = {};
// eslint-disable-next-line no-var
var inInfo = {};
let settings = {};

function connectElgatoStreamDeckSocket(
  inPort,
  inUUID,
  inRegisterEvent,
  inInfo,
  inActionInfo,
) {
  uuid = inUUID;

  actionInfo = JSON.parse(inActionInfo); // cache the info
  inInfo = JSON.parse(inInfo);
  // eslint-disable-next-line no-undef
  websocket = new WebSocket('ws://127.0.0.1:' + inPort);

  settings = getPropFromString(actionInfo, 'payload.settings', false);
  console.log(settings, actionInfo);

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

const getPropFromString = (jsn, str, sep = '.') => {
  const arr = str.split(sep);
  return arr.reduce(
    (obj, key) =>
      // eslint-disable-next-line no-prototype-builtins
      obj && obj.hasOwnProperty(key) ? obj[key] : undefined,
    jsn,
  );
};

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
