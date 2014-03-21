# Yammertime

A visualization of Yammer updates and conversations, Yammertime pulls content from your Yammer feed and displays it in a clean and simple wall interface. It is originally forked from [ganeshtoday/yammerfall](https://github.com/ganeshtoday/yammerfall).

Yammertime is released under the MIT License. 

Copyright (c) 2014 Ganesh Kumaraswamy, Umar Bolatov, Christopher Parsons.

## Build Instructions

1. Install [NodeJS](http://nodejs.org/).

2. Install Grunt CLI, bower, and bower-installer, globally.

        npm -g install grunt-cli bower bower-installer

3. Run `npm install` from command line at root project folder.

    This will read the *package.json* file and pull in all required node modules and put into a directory called *node_modules*. This directory is generated so it can be deleted and should not be checked into source control. If deleted, running `npm install` will re-create it.

4. Use `grunt` to build:

	- `grunt bower` will download the various JavaScript dependencies, and copy them into the `src/scripts/vendor` folder
    - `grunt build` will create a debug/test version of the site (i.e. LESS compilation)
    - `grunt prod` will create a production version of the site (i.e. JavaScript and CSS concatenated and minified)
    - `grunt server` will create the debug/test version of the site, then create a simple testing server. It also turns on `watch` which waits for file updates and runs the appropriate build tasks (e.g. on a LESS file update, it will re-compile the CSS files)
    - `grunt prodserver` will create the production version of the site, then create a simple testing server