const fs = require('fs'),
moment = require('moment');

//Convert "-" to "--" from process argv to make compatable with minimist
const cliArgs = () => {
for (var c = 0; c < process.argv.length; c++) {
	if (process.argv[c].startsWith('-')) {
		process.argv[c] = ('-'+process.argv[c])
	}
}
return process.argv;
}

//Write data to log. Created this so its easier to see just the output from this plugin instead of all info that is logged to the SD Logs.
function writeToLog(data) {
    fs.appendFile("log.txt", (moment().format('M/D/YYYY-h:mm:ss: ') + data) +"\n", (err) => {
        if (err) {console.log(err)};
        console.log("Log Saved!");
    })
}

module.exports = {
 cliArgs: cliArgs,
 writeToLog: writeToLog
};