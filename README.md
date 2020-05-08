# Streamdeck-NodeJS
Allows you to run NodeJS with the elgato streamdeck by building into a compiled .exe with pkg.

# Installation
- Clone repo
- Run `npm install` 

# Usage
- Run `pkg -t win main.js`
- Take the created exe and add that to your plugin folder
- Set the "CodePath" in your plugins manifest to the exe's name
- Build the plugin as you normally would and test your actions.

# Notes
There may be things that are redundant or could have been done better this is my first framework-esque thing so i am still learning.
I have not done anything advanced yet in testing, but the plugin does register, and actions do work so far so i see no reason why adding actual functions for actions would not work.

