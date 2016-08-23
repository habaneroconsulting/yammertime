# Yammertime [![devDependency Status](https://david-dm.org/habaneroconsulting/yammertime/dev-status.svg)](https://david-dm.org/habaneroconsulting/yammertime#info=devDependencies) [![Build status](https://travis-ci.org/habaneroconsulting/yammertime.svg)](http://travis-ci.org/habaneroconsulting/yammertime)

A visualization of Yammer updates and conversations, Yammertime pulls content from your Yammer feed and displays it in a clean and simple wall interface. It is originally forked from [ganeshtoday/yammerfall](https://github.com/ganeshtoday/yammerfall).

Yammertime is released under the MIT License.

Copyright (c) 2016 Ganesh Kumaraswamy, Umar Bolatov, Christopher Parsons.

## Build Instructions

1. Install [NodeJS](http://nodejs.org/).

2. Run `npm install` from command line at root project folder.

    This will read the *package.json* file and pull in all required node modules and put into a directory called *node_modules*. This directory is generated so it can be deleted and should not be checked into source control. If deleted, running `npm install` will re-create it.

3. Use `npm` to build:

    - `npm run-script build` will create a debug/test version of the site (i.e. LESS compilation)
    - `npm run-script production` will create a production version of the site (i.e. JavaScript and CSS concatenated and minified)
    - `npm run-script serve` will create the debug/test version of the site, then create a simple testing server