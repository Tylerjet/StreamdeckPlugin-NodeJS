# Streamdeck-NodeJS

Allows you to run NodeJS with the elgato streamdeck by building into a compiled .exe with pkg.

# Installation

- Clone repo
- Run `npm install`

# Usage

## If making a new plugin

- Rename com.rename-me.sdPlugin to the name of your choice (keeping com. and .sdPlugin as those are needed obviously), as well as changing the Rename Me sections in the manifest.json within the folder
- Add any images/icons needed into the plugin folder as well as adding PI elements and files if needed.
- Edit `build.js` in your favorite text editor, and change the `pluginName` variable to match the name you gave the folder
- Create your plugin `main.js` is supplied as a template and base to build off of
- Run `npm run build`
- The entire plugin will be build and compiled using the latest version of elgatos distribution tool to the newly created releases folder at the root of the repo
- You can then launch the file which will install to streamdeck

## Building into existing plugin

- Edit `build.js` in your favorite text editor and edit `pluginName` to your plugins folder name and `devPath` to the path just before your plugin folder
- Create your plugin. (`main.js` is supplied as a template and base to build off of)
- run `npm run build"

# Notes

There may be things that could have been done better but im still learning as i go.

# Known Issues

.exe files that are packaged into the pkg exe must be extracted and placed outside the pkg exe, and must have their spawn function called using `process.cwd()` instead of `__dirname` as `__dirname` will use the snapshot path and will not work properly. You can use `.findFilesInPkg()` with the filter set as a regex expression in this case `/\.exe$/` to find any and all files that match to be extracted and it will do it automatically.

Any .dll files that are required with .node files must be placed outside the pkg exe and distributed with the .exe
