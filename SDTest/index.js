const Chalk = require('chalk');
const config = require('./config');
const { fork } = require('child_process');
const rlSync = require('readline-sync');
const { spawn } = require('cross-spawn');
const path = require('path');
const Diff = require('diff');
const assert = require('assert');
const manifest = require(path.join(config.executable.path, config.executable.manifest));
const pluginExe = config.executable.winexe; // Setting to windows only since my plugin template is windows only until it works for osx but i have no way of testing so windows it is
const forked = fork('server.js');
console.log(Chalk.green('<status>Web Socket Server Started....'));
// Registration Stuff
const info = {
  application: {
    language: 'en',
    platform: config.server.winplatform,
    version: '4.0.0',
  },
  devices: [
    {
      id: config.server.deviceId,
      size: {
        columns: 5,
        rows: 3,
      },
      type: 0,
    },
  ],
};

const actionIndex = selectAction();

/* Ensure that actions are lowercase as thats how the SD app will send them to your plugin 
learned this firsthand when my action had a uppercase letter and i wondered why it worked here but not in the actual streamdeck app */
try {
  const action = manifest.Actions[actionIndex].UUID;
  const diff = Diff.diffChars(action, action.toLowerCase());
  let diffString = '';
  diff.forEach((part) => {
    const color = part.added ? Chalk.green : part.removed ? Chalk.red : Chalk.grey;
    part.value = color(part.value);
    diffString += part.value;
  });
  assert.strictEqual(
    manifest.Actions[actionIndex].UUID,
    manifest.Actions[actionIndex].UUID.toLowerCase(),
    new Error(`Expected ${action} to equal ${action.toLowerCase()}
Please correct this in manifest.json and your plugin script (default: main.js)
${diffString}`),
  );
} catch (error) {
  console.log(Chalk.red(error));
  forked.disconnect();
  forked.removeAllListeners();
  forked.kill();
  process.exit();
}
// ------------------------------------------------

console.log(
  [
    'Green Text denotes hardware action',
    'Green Highlight denotes hardware messages sent',
    'Cyan highlight denotes messages received from plugin',
  ].join('\n'),
);

forked.send({ event: 'registerActionIndex', arguments: actionIndex });
const registrationParams = [
  '-port',
  config.server.port,
  '-pluginUUID',
  manifest.Actions[actionIndex].UUID,
  '-registerEvent',
  'registerEvent',
  '-info',
  JSON.stringify(info),
  '-break',
  '-SDEMU',
];

console.log(`spawning ${pluginExe} in ${config.executable.path}`);
const plugin = spawn(pluginExe, registrationParams, {
  cwd: config.executable.path,
  stdio: 'inherit',
});
console.log(`${pluginExe} has a PID of ${plugin.pid}`);

plugin.on('error', () => {
  // eslint-disable-next-line no-undef
  // console.log(arguments);
});

plugin.on('exit', () => {
  // eslint-disable-next-line no-undef
  // console.log(arguments);
});

forked.on('message', (msg) => {
  if (msg.error) {
    console.log(msg.error);
  }
  switch (msg.event) {
    case 'quit':
      forked.disconnect();
      forked.removeAllListeners();
      forked.kill();
      break;
  }
});
promptUser();

function promptUser() {
  const msg = { event: '', arguments: null };
  const cmd = rlSync.question(`
    Enter: 
    'kd' for keyDown 
    'ku' for keyUp
    'wa' for willAppear
    'wd' for willDisappear
    'dc' for deviceDidConnect
    'dd' for deviceDidDisconnect
    'al' for applicationDidLaunch
    'at' for applicationDidTerminate
    'pa' for propertyInspectorDidAppear
    'pd' for propertyInspectorDidDisappear
    'sp' for sendToPlugin

    To quit, press 'q'\n`);

  switch (cmd) {
    case 'kd':
      msg.event = 'keyDown';
      forked.send(msg);
      break;
    case 'ku':
      msg.event = 'keyUp';
      forked.send(msg);
      break;
    case 'wa':
      msg.event = 'willAppear';
      forked.send(msg);
      break;
    case 'wd':
      msg.event = 'willDisappear';
      forked.send(msg);
      break;
    case 'dc':
      msg.event = 'deviceDidConnect';
      forked.send(msg);
      break;
    case 'dd':
      msg.event = 'deviceDidDisconnect';
      forked.send(msg);
      break;
    case 'q':
      msg.event = 'before-quit';
      forked.send(msg);
      return;
    case 'al':
      msg.event = 'applicationDidLaunch';
      forked.send(msg);
      break;
    case 'at':
      msg.event = 'applicationDidTerminate';
      forked.send(msg);
      break;
    case 'pa':
      msg.event = 'propertyInspectorDidAppear';
      forked.send(msg);
      break;
    case 'pd':
      msg.event = 'propertyInspectorDidDisappear';
      forked.send(msg);
      break;
    case 'sp':
      msg.event = 'sendToPlugin';
      forked.send(msg);
      break;
    default:
      break;
  }
  promptUser();
}

function selectAction() {
  let menu = 'Enter: \n';
  manifest.Actions.forEach((act, idx) => {
    menu += `'${idx}' for UUID: ${act.UUID} \n`;
  });

  return rlSync.question(menu);
}
