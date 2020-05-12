const { exec } = require('pkg'),
fs = require('fs'),
{ execFile } = require('child_process'),
//Change these to match your build info
DevPath = "D:\\DevelopmentProjects\\",
PluginName = "com.test",
ExeName = "test.exe"

console.log("Building EXE");

exec([ 'test.js', '--target', 'win', '--output' ,'test.exe' ]).then(()=> {
	console.log("EXE Built!")
	console.log("Copying File to "+DevPath+PluginName+".sdPlugin Folder");
	fs.copyFile("test.exe",DevPath+PluginName+".sdPlugin\\"+ExeName, (err) =>{
		if (err) {console.log(err)}
		//console.log("File Copied!")
		console.log("Deleting existing plugin")
		fs.unlink(DevPath+'PluginOutput\\'+PluginName+'.streamDeckPlugin',(err) =>{
			if (err) {
				if(err.errno == -4058) {
					console.log("Plugin already does not exist")
				} else {console.log(error)}
			}
			console.log("Plugin Deleted")
			console.log("Building New Plugin")
			const child = execFile(DevPath+'DistributionTool.exe', ['-b','-i', DevPath+PluginName+'.sdPlugin','-o',DevPath+'PluginOutput'], (error, stdout, stderr) => {
  				if (error) {console.log(error)}
  				console.log(stdout)
			})
		})
	})
}).catch((err) => {
		console.log(err)
})
