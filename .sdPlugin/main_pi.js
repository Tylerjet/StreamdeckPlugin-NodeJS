var websocket = null,
  uuid = null,
  actionInfo = {},
  inInfo = {};
function connectSocket(
  inPort,
  inUUID,
  inRegisterEvent,
  inInfo,
  inActionInfo,
) {
  uuid = inUUID;
  actionInfo = JSON.parse(inActionInfo);
  inInfo = JSON.parse(inInfo);
  websocket = new WebSocket('ws://localhost:' + inPort);

  websocket.onopen = function () {
    var json = {
      event: inRegisterEvent,
      uuid: inUUID,
    };

    websocket.send(JSON.stringify(json));
    sendValueToPlugin('propertyInspectorConnected', 'PIC');
  };

  websocket.onmessage = function (evt) {
    var inputMessage = document.getElementById('Message');

    var jsonObj = JSON.parse(evt.data);
    var event = jsonObj['event'];
    var context = jsonObj['context'];
    var payload = jsonObj['payload'];

    if (payload.Message) {
      inputMessage.value = payload.Message;
    }
  };

  websocket.onclose = function () {};
}

/** the beforeunload event is fired, right before the PI will remove all nodes */
window.addEventListener('beforeunload', function (e) {
  e.preventDefault();

  sendValueToPlugin('propertyInspectorWillDisappear', 'PID');
  // Don't set a returnValue to the event, otherwise Chromium with throw an error.  // e.returnValue = '';
});

// our method to pass values to the plugin
function sendValueToPlugin(value, param) {
  if (websocket) {
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
