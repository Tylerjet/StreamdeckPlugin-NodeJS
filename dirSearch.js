var path = require('path'), 
    fs   = require('fs'),
    results = [],
    cPath = process.cwd();


/**
 * Find all files recursively in specific folder with specific extension, e.g:
 * findFilesInDir('./project/src', '.html') ==> ['./project/src/a.html','./project/src/build/index.html']
 * @param  {String} startPath    Path relative to this file or other file which requires this files
 * @param  {String} filter       Extension name, e.g: '.html'
 * @return {Array}               Result files with path string in an array
 */
function findFilesInDir(startPath,filter){
    var files=fs.readdirSync(startPath);

    if (!fs.existsSync(startPath)){
        console.log("no dir ",startPath);
        return;
    }

    files.forEach(function(file) {
        var filename=path.join(startPath,file);
        if(fs.lstatSync(filename).isDirectory()){
            inDirectory(filename,filter)
        } else if (filter.test(filename)) {
            //console.log('-- found: ',filename);
            results.push(filename)
            //console.log("Passed Filter:",results)
        }
    })
    //console.log("findFilesInDir:",results)
    return copyFiles(results);
}

function inDirectory(fileDir, filter) {
    var files=fs.readdirSync(fileDir);

    files.forEach(function(file) {
            var filename=path.join(fileDir,file);
            if(fs.lstatSync(filename).isDirectory()){
                inDirectory(filename,filter)
            } else if (filter.test(filename)) {
                //console.log('-- found: ',filename);
                results.push(filename)
                //console.log("Passed Filter in Directory Function:",results)
            }
        })
    return results
}

function copyFiles(fileArr) {
    //console.log("Copy File Area:",fileArr)
    for (let Item in fileArr) {
    console.log(fileArr[Item]);
    console.log(path.parse(fileArr[Item]).base)
    var file = path.parse(fileArr[Item]).base
    copyPath = path.join(cPath,file)
    let copy = fs.createReadStream(fileArr[Item]).pipe(fs.createWriteStream(copyPath), { end: true });
    copy.on('close', () => {
        console.log("file",fileArr[Item],"Copied")
    })
    
}
}

process.on('uncaughtException', err => {
    console.log(err)
}

module.exports = findFilesInDir;