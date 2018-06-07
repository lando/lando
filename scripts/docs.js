#!/usr/bin/env node

'use strict';

const _ = require('lodash');
const fs = require('fs-extra');
const jsdoc2md = require('jsdoc-to-markdown');
const Log = require('./../lib/logger.js');
const log = new Log({logLevelConsole: 'debug'});
const errors = [];
const util = require('./util.js');

// Files
const docs = {
  dest: './docs/api/api.md',
  files: [
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
    './plugins/lando-tooling/**/*.js',
  ],
  helpers: [
    './docs/helpers/helpers.js',
  ],
  partials: [
    './docs/partials/header.hbs',
    './docs/partials/body.hbs',
  ],
};

// Get the data so we can preprocess it
return jsdoc2md.getTemplateData({'files': docs.files, 'no-cache': true})

// Fix "aliases" and then render
.then(data => _.map(data, datum => util.fixAlias(datum)))

// Do the render
.then(data => jsdoc2md.render({
  'data': data,
  'global-index-format': 'none',
  'helper': docs.helpers,
  'partial': docs.partials,
}))

// Report and collect errors
.catch(error => {
  errors.push(error.message);
  log.error('ERROR: %', error.message);
})

// Write the file if we have data
.then(data => {
  if (data) {
    log.info('writing ' + docs.dest + '...');
    return fs.outputFile(docs.dest, data, error => {
      if (error) throw error;
    });
  }
})

// Do the final error throw if we can
.then(() => {
  if (!_.isEmpty(errors)) {
    log.error('API doc build failed! See above errors!!!');
    process.exit(54);
  }
});
