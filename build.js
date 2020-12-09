const { exec } = require('pkg');
const fs = require('fs-extra');
const { execFile } = require('child_process');
const path = require('path');
const http = require('https');
const extract = require('extract-zip');
const chalk = require('chalk');
// Used for Checking if the md5 of the file online has beenupdated since zip files do not have a version number
const crypto = require('crypto');
const hashNew = crypto.createHash('md5');
const hashExist = crypto.createHash('md5');
const buffers = [];
let CompBuffer;
// Change Variables below to match your build info
// Name of the plugin folder minus .sdPlugin
const pluginName = 'com.[rename-me]'; // com.(name of plugin)
const exeName = 'main.exe'; // Name of exe once built // TODO: Use variable to set the name in manifest.json so you only have to set it here then build
const pluginJS = 'package.json'; // set the script in the bin key of package.json (default is main.js)
const outputPath = '.\\' + process.argv[2]; // The folder you want to output the final plugin too, this is set to release in the build command in package.json
const zipPath = path.resolve('./DistributionToolWindows.zip');
const pluginPath = '.\\' + pluginName + '.sdPlugin';

// Makes my life a little easier than having to edit in 4 seperate locations and the code just a tad cleaner :Shrug:
function buildPlugin() {
  execFile(
    process.cwd() + '\\DistributionTool.exe',
    ['-b', '-i', pluginPath, '-o', outputPath],
    (err, stdout, stderr) => {
      if (err) {
        console.log(chalk.bgRed(err));
      }
      console.log(chalk.bgGreenBright.black(stdout));
    },
  );
}

function writeZip(data) {
  fs.writeFile(zipPath, data, { encoding: 'utf8' }, (err) => {
    if (err) {
      console.log(err);
    }
    console.log(chalk.bgGreenBright.black('File Download Complete!'));
    console.log(
      chalk.bgBlueBright.black('Unzipping DistributionTool file'),
    );

    // Extract the Distribution exe
    extract('./DistributionToolWindows.zip', {
      dir: process.cwd(),
    }).then(() => {
      console.log(chalk.bgGreenBright.black('File Extracted!'));

      // Build the plugin
      console.log(chalk.bgBlueBright.black('Building New Plugin!'));
      buildPlugin();
    });
  });
}

// ---------------------------------------------------------------------------------------
console.log(chalk.bgGreenBright.black('Building EXE'));
// Build the executable using the JS Script listed in pluginJS
fs.copy('.sdPlugin', pluginPath)
  .then(() => {
    fs.copy('reqExtFiles', pluginPath).then(() => {
      exec([pluginJS, '--target', 'win', '--output', exeName])
        .then(() => {
          console.log(chalk.bgGreenBright.black('EXE Built!'));

          // checking if the output folder already exists if it doesn't it will create it
          fs.ensureDir(outputPath, (err) => {
            if (err) {
              console.log(chalk.bgRed(err));
            }

            // Copy the created exe to the .sdPlugin folder
            console.log(
              chalk.bgBlueBright.black(
                'Copying ' + exeName + ' to ' + pluginPath,
              ),
            );
            fs.copy(
              exeName,
              pluginPath + '\\' + exeName,
              { overwrite: true },
              (err) => {
                if (err) {
                  console.log(chalk.bgRed(err));
                }
                console.log(
                  chalk.bgGreenBright.black(exeName + ' Copied!'),
                );

                // Delete the old streamdeck plugin file if it exists
                fs.remove(
                  outputPath +
                    '\\' +
                    pluginName +
                    '.streamDeckPlugin',
                  (err) => {
                    if (err) {
                      console.log(chalk.bgRed(err));
                    }
                  },
                );
                console.log(
                  chalk.bgRedBright.black(
                    'Old Plugin deleted from: ' + outputPath,
                  ),
                );

                // Download and extract the latest distribution tool for windows from elgatos site directly
                console.log(
                  chalk.bgBlueBright.black(
                    'Getting Distribution Tool',
                  ),
                );
                http
                  .get(
                    'https://developer.elgato.com/documentation/stream-deck/distributiontool/DistributionToolWindows.zip',
                    (response) => {
                      response.on('data', function (data) {
                        buffers.push(data);
                        hashNew.update(data, 'utf8');
                      });

                      response.on('end', function () {
                        CompBuffer = Buffer.concat(buffers);
                        let existHash;
                        const newHash = hashNew.digest('hex');

                        const file = fs.createReadStream(
                          'DistributionToolWindows.zip',
                        );
                        file.on('error', (err) => {
                          if (err.code === 'ENOENT') {
                            console.log(
                              chalk.bgRed(
                                'Tool does not yet exist now downloading!',
                              ),
                            );
                            writeZip(CompBuffer);
                          }
                        });
                        file.on('data', (data) => {
                          hashExist.update(data, 'utf8');
                        });
                        file.on('end', () => {
                          existHash = hashExist.digest('hex');
                          if (newHash === existHash) {
                            console.log(
                              chalk.bgGreenBright.black(
                                'DistributionTool already up to date!',
                              ),
                            );
                            fs.pathExists(
                              './DistributionTool.exe',
                              (err, exists) => {
                                if (err) {
                                  console.log(chalk.bgRed(err));
                                }
                                if (!exists) {
                                  console.log(
                                    chalk.bgBlueBright.black(
                                      'Unzipping DistributionTool file',
                                    ),
                                  );
                                  // Extract the Distribution exe
                                  extract(
                                    './DistributionToolWindows.zip',
                                    {
                                      dir: process.cwd(),
                                    },
                                  ).then(() => {
                                    console.log(
                                      chalk.bgGreenBright.black(
                                        'File Extracted!',
                                      ),
                                    );
                                  });
                                }
                                // Build the plugin
                                console.log(
                                  chalk.bgBlueBright.black(
                                    'Building New Plugin!',
                                  ),
                                );
                                buildPlugin();
                              },
                            );
                          } else {
                            writeZip(CompBuffer);
                          }
                        });
                      });
                    },
                  )
                  .on('error', (err) => {
                    if (
                      err.code === 'ENOTFOUND' &&
                      err.syscall === 'getaddrinfo'
                    ) {
                      console.log(
                        chalk.bgRed(
                          'Error: Could not connect to internet to check for updated DistributionTool',
                        ),
                      );
                      fs.pathExists(
                        '.\\DistributionTool.exe',
                        (err, exists) => {
                          if (err) {
                            console.log(chalk.bgRed(err));
                          }
                          if (exists) {
                            console.log(
                              chalk.bgBlueBright.black(
                                'Building New Plugin Using Existing DistributionTool!',
                              ),
                            );
                            buildPlugin();
                          }
                          if (!exists) {
                            console.log(
                              chalk.bgRed(
                                'No existing DistributionTool Found! Cannot proceed with build...Now exiting',
                              ),
                            );
                          }
                        },
                      );
                    } else {
                      console.log(chalk.bgRed(err.syscall));
                    }
                  });
              },
            );
          });
        })
        .catch((err) => {
          console.log(err);
        });
    });
  })
  .catch((err) => {
    console.log(err);
  })
  .catch((err) => {
    console.log(err);
  });
