'use strict';

/**
 * @file
 * This file/module contains common things needed by many tasks.
 */

// Grab needed dataz
var pkg = require('./../package.json');

// System info
var system = {
  platform: (process.platform !== 'darwin') ? process.platform : 'osx'
};

// Lando info
var version = pkg.version;
var pkgType = [system.platform, 'x64', 'v' + version].join('-');
var pkgExt = (system.platform === 'win32') ? '.exe' : '';
var pkgSuffix = pkgType + pkgExt;

// All js files
var jsFiles = [
  'Gruntfile.js',
  'bin/**/*.js',
  'cmds/**/*.js',
  'lib/**/*.js',
  'modules/**/*.js',
  'plugins/**/*.js',
  'tasks/**/*.js',
  'tests/**/*.js'
];

// Build assets
var buildFiles = [
  'bin/lando.*',
  'lib/**',
  'plugins/**',
  '*.json',
  'config.yml'
];

// Return our objects
module.exports = {
  system: system,
  lando: {
    version: version,
    pkgType: pkgType,
    pkgExt: pkgExt,
    pkgSuffix: pkgSuffix
  },
  files: {
    js: jsFiles,
    build: buildFiles
  }
};
