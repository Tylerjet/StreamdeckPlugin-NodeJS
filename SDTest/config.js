const dotenv = require('dotenv');
const Chalk = require('chalk');
const envConfig = dotenv.config();

if (envConfig.error){
    const errorMessage = '>>>  The environment ("./.env") file could not be loaded. Check that it exists and that it is valid. <<<';
    throw Error (Chalk.bgRed.white.underline(errorMessage));
}

const config = {};
config.executable = {
    path: process.env.BUILD_PATH,
    manifest: 'manifest.json',
    winexe: process.env.WINEXE_NAME
};
config.server = {
    deviceId : process.env.DEVICE_ID,
    port : process.env.DEVICE_PORT,
    winplatform: 'windows',
};

module.exports = config;
