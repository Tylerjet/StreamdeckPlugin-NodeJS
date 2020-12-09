let wesocket = null;
let uuid = null;
let actionInfo = {};
let settings = {};
const onchangeevt = 'onchange';

function connectElgatoStreamDeckSocket(
  inPort,
  inUUID,
  inRegisterEvent,
  inInfo,
  inActionInfo,
) {
  uuid = inUUID;
  actionInfo = JSON.parse(inActionInfo);
  inInfo = JSON.parse(inInfo);
  ebsocket = new WebSocket('ws://127.0.0.1:' + inPort);

  addDynamicStyles(inInfo.colors, 'connectElgatoStreamDeckSocket');

  settings = getPropFromString(actionInfo, 'payload.settings', false);
  console.log(settings, actionInfo);

  websocket.onopen = function () {
    var json = {
      event: inRegisterEvent,
      uuid: inUUID,
    };
    // register property inspector to Stream Deck
    websocket.send(JSON.stringify(json));
  };

  websocket.onmessage = function (evt) {
    // Received message from Stream Deck
    var jsonObj = JSON.parse(evt.data);
    var event = jsonObj.event;
  };
}

function sendValueToPlugin(value, param) {
  if (websocket && websocket.readyState === 1) {
    const json = {
      action: actionInfo['action'],
      event: 'sendToPlugin',
      context: uuid,
      payload: {
        [param]: value,
      },
    };
    websocket.send(JSON.stringify(json));
  }
}

const getPropFromString = (jsn, str, sep = '.') => {
  const arr = str.split(sep);
  return arr.reduce(
    (obj, key) =>
      obj && obj.hasOwnProperty(key) ? obj[key] : undefined,
    jsn,
  );
};
