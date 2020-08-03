const { exec } = require('pkg'),
fs = require('fs-extra'),
{ execFile } = require('child_process'),
path = require('path'),
http = require('https'),
extract = require('extract-zip'),
chalk = require('chalk'),
//Used for Checking if the md5 of the file online has beenupdated since zip files do not have a version number
crypto = require('crypto'),
hashNew = crypto.createHash('md5'),
hashExist = crypto.createHash('md5'),
buffers = [];
var CompBuffer;
//Change Variables below to match your build info
//Path to just before .sdPlugin folder that you are building
const devPath = ".\\", //make sure to add \\ at the end *Note* ".\\"" will build in the same folder as the script and sdPlugin folder when first downloaded.
//Name of the folder minus .sdPlugin
pluginName = "com.rename-me", //com.(name of plugin)
exeName = "main.exe",
pluginJS = "main.js", //name of script file if you are renaming it
outputPath = process.argv[2]; //The folder you want to output the final plugin too, this is set to release in the build command in package.json

// Makes my life a little easier and the code just a tad cleaner :Shrug:
function buildPlugin() {
	const child = execFile(devPath+'DistributionTool.exe', ['-b','-i', devPath+pluginName+'.sdPlugin','-o',devPath+outputPath], (err, stdout, stderr) => {
		if (err) {console.log(chalk.bgRed(err))}
			console.log(chalk.bgGreenBright.black(stdout))
		  })
}

function writeZip(data) {
    fs.writeFile(zipPath, data,{encoding: 'utf8'}, (err) => {
        if (err) {console.log(err)}
        console.log(chalk.bgGreenBright.black(("File Download Complete!"))
    })
}
// ---------------------------------------------------------------------------------------
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
			console.log(chalk.bgBlueBright.black("Getting Distribution Tool"))
			http.get("https://developer.elgato.com/documentation/stream-deck/distributiontool/DistributionToolWindows.zip", (response) => {
				response.on('data', function (data) {
                    buffers.push(data)
                    hashNew.update(data, 'utf8')
                })

				response.on('end', function(){
					CompBuffer = Buffer.concat(buffers)
                    var newHash,existHash
                    newHash = hashNew.digest('hex')

                    file = fs.createReadStream('DistributionToolWindows.zip')
                    file.on('error', (err) => {
                        if (err.code == "ENOENT") {
                            writeZip(CompBuffer)
                        }
                    })
                    file.on('data', (data) => {
                        hashExist.update(data, 'utf8')
                    })
                    file.on('end', () => {
                        existHash = hashExist.digest('hex')
                        console.log(existHash)
                        console.log(newHash == existHash)
                        if (newHash == existHash) {
                            console.log(chalk.bgGreenBright.black("Application already up to date!"))
                        } else {
                            writeZip(CompBuffer)
						}
						console.log(chalk.bgBlueBright.black("Unzipping DistributionTool file"));

						//Extract the Distribution exe
						extract('./DistributionToolWindows.zip', {dir: process.cwd()}).then(() => {
							console.log(chalk.bgGreenBright.black("File Extracted!"))
	
							//Build the plugin
							console.log(chalk.bgBlueBright.black("Building New Plugin!"))
							buildPlugin()
							})
						})
					})
					}).on("error", (err) => {
						if (err.code == 'ENOTFOUND' && err.syscall == 'getaddrinfo') {
							console.log(chalk.bgRed("Error: Could not connect to internet to check for updated DistributionTool"))
							fs.pathExists(path.join(devPath,"DistributionTool.exe"), (err,exists) => {
								if (err) {console.log(chalk.bgRed(err))}
								if (exists) {
									console.log(chalk.bgBlueBright.black("Building New Plugin Using Existing DistributionTool!"))
									buildPlugin()
								}
								if (!exists) {
									console.log(chalk.bgRed("No existing DistributionTool Found! Cannot proceed with build...Now exiting"))}
							})
						} else {
						console.log(chalk.bgRed(err.syscall))}
				})
			})
		})
	})
}).catch((err) => {
		console.log(err)
})