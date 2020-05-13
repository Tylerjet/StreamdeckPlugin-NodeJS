const { exec } = require('pkg'),
fs = require('fs-extra'),
{ execFile } = require('child_process'),
path = require('path'),
http = require('https'),
extract = require('extract-zip'),
//Change Variables below to match your build info
//Path to just before .sdPlugin folder that you are building
devPath = ".\\", //make sure to add \\ at the end *Note* ".\\"" will build in the same folder as the script and sdPlugin folder when first downloaded.
//Name of the folder minus .sdPlugin
pluginName = "com.rename-me", //com.(name of plugin)
exeName = "main.exe",
pluginJS = "main.js", //name of script file if you are renaming it
outputPath = process.argv[2];


console.log("Building EXE");
exec([pluginJS, '--target', 'win', '--output' ,exeName]).then(()=> {
	console.log("EXE Built!")
	console.log("Checking if "+devPath+outputPath+" exists")
	fs.ensureDir(devPath+outputPath, (err) => {
		if(err) { console.log(err)}
			fs.pathExists(devPath+outputPath, (err,exists) => {
				if(exists) {console.log("Folder Exists!")}
				if(!exists) {console.log(devPath+outputPath+" has been created")}
	console.log("Copying"+exeName+" to "+devPath+pluginName+".sdPlugin Folder");
	fs.copy(exeName ,devPath+pluginName+".sdPlugin\\"+exeName, {'overwrite': true}, (err) =>{
		if (err) {console.log(err)}
		console.log(exeName+" Copied!")
		fs.remove(devPath+outputPath+'\\'+pluginName+'.streamDeckPlugin', (err) => {
			if (err) {console.log(err)}
			})
			console.log("Old Plugin deleted from: ",devPath+outputPath)
			const zipPath = path.resolve('./DistributionToolWindows.zip')
			const file = fs.createWriteStream(zipPath);
			console.log("Getting Distribution Tool")
			http.get("https://developer.elgato.com/documentation/stream-deck/distributiontool/DistributionToolWindows.zip", (response) => {
				response.pipe(file);
				file.on("finish", () => {
					console.log("Unzipping DistributionTool file");
					extract('./DistributionToolWindows.zip', {dir: process.cwd()}).then(() => {
						console.log("File Extracted!")
						console.log("Building New Plugin!")
						const child = execFile(devPath+'DistributionTool.exe', ['-b','-i', devPath+pluginName+'.sdPlugin','-o',devPath+outputPath], (err, stdout, stderr) => {
		  				if (err) {console.log(err)}
		  					console.log(stdout)
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