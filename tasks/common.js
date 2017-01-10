'use strict';

/**
 * @file
 * This file/module contains common things needed by many tasks.
 */

// System info
var system = {
  platform: (process.platform !== 'darwin') ? process.platform : 'osx'
};

// All js files
var jsFiles = [
  'Gruntfile.js',
  'bin/**/*.js',
  'cmds/**/*.js',
  'lib/**/*.js',
  'tasks/**/*.js'
];

// Return our objects
module.exports = {
  system: system,
  files: {
    js: jsFiles
  }
};
