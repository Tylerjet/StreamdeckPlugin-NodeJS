const path = require('path');
const fs = require('fs');
let results = [];
const isDev = false;

/**
 * Find all files recursively in specific folder with specific extension, e.g:
 * findFilesInDir('./project/src', '.html') ==> ['./project/src/a.html','./project/src/build/index.html']
 * @param  {String} searchPath    Path relative to this file or other file which requires this files
 * @param  {String} filter       Extension name, e.g: '.html'
 * @return {Array}               Result files with path string in an array
 */

function inDirectory(fileDir, filter) {
  const files = fs.readdirSync(fileDir);

  files.forEach(function (file) {
    const filename = path.join(fileDir, file);
    if (fs.lstatSync(filename).isDirectory()) {
      inDirectory(filename, filter);
    } else if (filter.test(filename)) {
      if (isDev) {
        console.log('-- found: ', filename);
      }
      results.push(filename);
      if (isDev) {
        console.log('Passed Filter in Directory Function:', results);
      }
    }
  });
  return results;
}

function copyFiles(fileArr, cPath) {
  if (isDev) {
    console.log('Copy File Arr:', fileArr);
  }
  for (let Item in fileArr) {
    if (isDev) {
      console.log(fileArr[Item]);
    }
    if (isDev) {
      console.log(path.parse(fileArr[Item]).base);
    }
    const file = path.parse(fileArr[Item]).base;
    const copyPath = path.join(cPath, file);
    const copy = fs
      .createReadStream(fileArr[Item])
      .pipe(fs.createWriteStream(copyPath), { end: true });
    copy.on('close', () => {
      console.log('file', fileArr[Item], 'Copied');
    });
  }
}

module.exports = (searchPath, copyPath = process.cwd(), filter) => {
  const files = fs.readdirSync(searchPath);

  if (!fs.existsSync(searchPath)) {
    console.log('no dir ', searchPath);
    return;
  }

  files.forEach(function (file) {
    const filename = path.join(searchPath, file);
    if (fs.lstatSync(filename).isDirectory()) {
      inDirectory(filename, filter);
    } else if (filter.test(filename)) {
      if (isDev) {
        console.log('-- found: ', filename);
      }
      results.push(filename);
      if (isDev) {
        console.log('Passed Filter:', results);
      }
    }
  });
  if (isDev) {
    console.log('findFilesInDir:', results);
  }
  return copyFiles(results, copyPath);
};
