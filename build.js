const { exec } = require('pkg'),
fs = require('fs-extra'),
{ execFile } = require('child_process'),
path = require('path'),
http = require('https'),
extract = require('extract-zip'),
chalk = require('chalk'),
//Change Variables below to match your build info
//Path to just before .sdPlugin folder that you are building
devPath = ".\\", //make sure to add \\ at the end *Note* ".\\"" will build in the same folder as the script and sdPlugin folder when first downloaded.
//Name of the folder minus .sdPlugin
pluginName = "com.rename-me", //com.(name of plugin)
exeName = "main.exe",
pluginJS = "main.js", //name of script file if you are renaming it
outputPath = process.argv[2]; //The folder you want to output the final plugin too, this is set to release in the build command in package.json

console.log(chalk.bgGreenBright.black("Building EXE"));
//Build the executable using the JS Script listed in pluginJS
exec([pluginJS, '--target', 'win', '--output' ,exeName]).then(()=> { 
	console.log(chalk.bgGreenBright.black("EXE Built!"))
	console.log(chalk.bgYellowBright.black("Checking if "+devPath+outputPath+" exists"))
	//checking if the output folder already exists if it doesn't it will create it
	fs.ensureDir(devPath+outputPath, (err) => { 

		if(err) { console.log(chalk.bgRed(err))}
			fs.pathExists(devPath+outputPath, (err,exists) => {
				if(exists) {console.log(chalk.bgGreenBright.black(devPath+outputPath+" Exists!"))}
				if(!exists) {console.log(chalk.bgYellowBright.black(devPath+outputPath+" has been created"))}

	//Copy the created exe to the .sdPlugin folder
	console.log(chalk.bgBlueBright.black("Copying "+exeName+" to "+devPath+pluginName+".sdPlugin Folder"));
	fs.copy(exeName ,devPath+pluginName+".sdPlugin\\"+exeName, {'overwrite': true}, (err) =>{ 
		if (err) {console.log(chalk.bgRed(err))}
		console.log(chalk.bgGreenBright.black(exeName+" Copied!"))

		//Delete the old streamdeck plugin file if it exists
		fs.remove(devPath+outputPath+'\\'+pluginName+'.streamDeckPlugin', (err) => {
			if (err) {console.log(chalk.bgRed(err))}
			})
			console.log(chalk.bgRedBright.black("Old Plugin deleted from: ",devPath+outputPath))

			//Download and extract the latest distribution tool for windows from elgatos site directly
			const zipPath = path.resolve('./DistributionToolWindows.zip')
			const file = fs.createWriteStream(zipPath);
			console.log(chalk.bgBlueBright.black("Getting Distribution Tool"))
			http.get("https://developer.elgato.com/documentation/stream-deck/distributiontool/DistributionToolWindows.zip", (response) => {
				response.pipe(file);
				file.on("finish", () => {
					console.log(chalk.bgBlueBright.black("Unzipping DistributionTool file"));

					//Extract the Distribution exe
					extract('./DistributionToolWindows.zip', {dir: process.cwd()}).then(() => {
						console.log(chalk.bgGreenBright.black("File Extracted!"))

						//Build the plugin
						console.log(chalk.bgBlueBright.black("Building New Plugin!"))
						const child = execFile(devPath+'DistributionTool.exe', ['-b','-i', devPath+pluginName+'.sdPlugin','-o',devPath+outputPath], (err, stdout, stderr) => {
		  				if (err) {console.log(chalk.bgRed(err))}
		  					console.log(chalk.bgGreenBright.black(stdout))
							})
						})
					})
				})
			})
		})
	})
}).catch((err) => {
		console.log(err)
})