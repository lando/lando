#!/usr/bin/env node

'use strict';

const _ = require('lodash');
const chalk = require('yargonaut').chalk();
const fs = require('fs-extra');
const jsdoc2md = require('jsdoc-to-markdown');
const Promise = require('bluebird');

const fileMap = [
  {src: 'lib/lando.js', dest: 'docs/api/lando.md'},
  {src: 'lib/app.js', dest: 'docs/api/app.md'},
  {src: 'lib/bootstrap.js', dest: 'docs/api/bootstrap.md'},
  {src: 'lib/cache.js', dest: 'docs/api/cache.md'},
  {src: 'lib/cli.js', dest: 'docs/api/cli.md'},
  {src: 'lib/config.js', dest: 'docs/api/config.md'},
  {src: 'lib/engine.js', dest: 'docs/api/engine.md'},
  {src: 'lib/error.js', dest: 'docs/api/error.md'},
  {src: 'lib/events.js', dest: 'docs/api/events.md'},
  {src: 'lib/logger.js', dest: 'docs/api/log.md'},
  {src: 'lib/networks.js', dest: 'docs/api/networks.md'},
  {src: 'lib/node.js', dest: 'docs/api/node.md'},
  {src: 'lib/plugins.js', dest: 'docs/api/plugins.md'},
  {src: 'lib/promise.js', dest: 'docs/api/promise.md'},
  {src: 'lib/registry.js', dest: 'docs/api/registry.md'},
  {src: 'lib/shell.js', dest: 'docs/api/shell.md'},
  {src: 'lib/tasks.js', dest: 'docs/api/tasks.md'},
  {src: 'lib/user.js', dest: 'docs/api/user.md'},
  {src: 'lib/utils.js', dest: 'docs/api/utils.md'},
  {src: 'lib/yaml.js', dest: 'docs/api/yaml.md'}
];

// Collect any errors
//
// @NOTE: this will save time so we can see ALL the errors at once instead
// of one per CI build
const errors = [];

// Go through and do the dance
Promise.each(fileMap, function(file) {

  // Render the things
  return jsdoc2md.render({files: file.src})

  // Report and collect errors
  .catch(function(error) {
    errors.push(error.message);
    console.log(chalk.red(error.message));
  })

  // Write the file if we have data
  .then(function(data) {
    if (data) {
      console.log('writing ' + file.dest + '...');
      return fs.outputFile(file.dest, data, function(error) { if (error) { throw error; } });
    }
  });
})

// Do the final error throw if we can
.then(function() {
  if (!_.isEmpty(errors)) {
    console.log();
    console.log(chalk.red('API doc build failed! See above errors!!!'));
    process.exit(54);
  }
});
