const { exec } = require('pkg'),
fs = require('fs'),
{ execFile } = require('child_process'),
path = require('path'),
http = require('https'),
extract = require('extract-zip'),
//Change Variables below to match your build info
//Path to just before .sdPlugin folder that you are building
devPath = "D:\\DevelopmentProjects\\", //make sure to add \\ at the end 
//Name of the folder minus .sdPlugin
pluginName = "com.test", //com.(name of plugin)
exeName = "test.exe",
pluginJS = "test.js", //name of script file if you are renaming it
outputPath = process.argv[2];

console.log("Building EXE");

exec([pluginJS, '--target', 'win', '--output' ,exeName]).then(()=> {
	console.log("EXE Built!")
	console.log("Copying File to "+devPath+pluginName+".sdPlugin Folder");
	fs.copyFile(exeName ,devPath+pluginName+".sdPlugin\\"+exeName, (err) =>{
		if (err) {console.log(err)}
		//console.log("File Copied!")
			if(fs.existsSync(devPath+outputPath) == false) {
				fs.mkdir(devPath+outputPath, (err) => {
					if(err) { 
						if (err.code == "EEXIST") {
							console.log("Folder Exists")
						}
						console.log(err)
					}
					console.log(devPath+outputPath+" folder created!")
				})
			}
		fs.unlink(devPath+outputPath+'\\'+pluginName+'.streamDeckPlugin',(err) =>{
			var exists = true;
			if (err) {
				if(err.code == "ENOENT") {
					console.log("Plugin already does not exist")
					exists = false
				} else {console.log(err)}
			}
			if (exists) {console.log("Existing plugin deleted")}
			const zipPath = path.resolve('./DistributionToolWindows.zip')
			const file = fs.createWriteStream(zipPath);
			console.log("Getting Distribution Tool")
			http.get("https://developer.elgato.com/documentation/stream-deck/distributiontool/DistributionToolWindows.zip", (response) => {
				response.pipe(file);
				file.on("finish", () => {
					console.log("Unzipping DistributionTool file");
					extract('./DistributionToolWindows.zip', {dir: process.cwd()}).then(() => {
						console.log("File Extracted")
						console.log("Building New Plugin")
						const child = execFile(/*devPath+*/'DistributionTool.exe', ['-b','-i', devPath+pluginName+'.sdPlugin','-o',devPath+outputPath], (err, stdout, stderr) => {
		  				if (err) {console.log(err)}
		  					console.log(stdout)
						})
					})
				})
			})
		})
	})
}).catch((err) => {
		console.log(err)
})
