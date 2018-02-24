#!/usr/bin/env node

'use strict';

const _ = require('lodash');
const chalk = require('yargonaut').chalk();
const dest = './docs/api/api.md';
const fs = require('fs-extra');
const jsdoc2md = require('jsdoc-to-markdown');

const fileMap = [
  './lib/bootstrap.js',
  './lib/cache.js',
  './lib/config.js',
  './lib/cli.js',
  './lib/events.js',
  './lib/logger.js',
  './lib/node.js',
  './lib/plugins.js',
  './lib/promise.js',
  './lib/scan.js',
  './lib/shell.js',
  './lib/tasks.js',
  './lib/updates.js',
  './lib/user.js',
  './lib/yaml.js',
  './plugins/lando-app/*.js',
  './plugins/lando-app/**/*.js',
  './plugins/lando-engine/*.js',
  './plugins/lando-engine/**/*.js',
  './plugins/lando-init/*.js',
  './plugins/lando-init/**/*.js',
  './plugins/lando-recipes/*.js',
  './plugins/lando-recipes/**/*.js',
  './plugins/lando-services/*.js',
  './plugins/lando-services/**/*.js',
  './plugins/lando-tooling/*.js',
  './plugins/lando-tooling/**/*.js'
];

const helpers = [
  './docs/helpers/helpers.js'
];

const partials = [
  './docs/partials/header.hbs',
  './docs/partials/body.hbs'
];

// Collect any errors
//
// @NOTE: this will save time so we can see ALL the errors at once instead
// of one per CI build
const errors = [];

// Render the things
return jsdoc2md.render({
  files: fileMap,
  'global-index-format': 'none',
  helper: helpers,
  partial: partials
})

// Report and collect errors
.catch(function(error) {
  errors.push(error.message);
  console.log(chalk.red('ERROR: ' + error.message));
})

// Write the file if we have data
.then(function(data) {
  if (data) {
    console.log('writing ' + dest + '...');
    return fs.outputFile(dest, data, function(error) { if (error) { throw error; } });
  }
})

// Do the final error throw if we can
.then(function() {
  if (!_.isEmpty(errors)) {
    console.log();
    console.log(chalk.red('API doc build failed! See above errors!!!'));
    process.exit(54);
  }
});
