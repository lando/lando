#!/usr/bin/env node

'use strict';

const _ = require('lodash');
const errors = [];
const fs = require('fs-extra');
const jsdoc2md = require('jsdoc-to-markdown');
const Log = require('./../lib/logger');
const log = new Log({logLevelConsole: 'debug', logName: 'apidocs'});
const path = require('path');
const Promise = require('./../lib/promise');
const util = require('./util');
const dest = path.resolve('docs', 'api');

// Files
const docs = {
  sections: {
    app: ['./lib/app.js'],
    cache: ['./lib/cache.js'],
    engine: ['./lib/engine.js'],
    error: ['./lib/error.js'],
    events: ['./lib/events.js'],
    lando: ['./lib/lando.js'],
    log: ['./lib/logger.js'],
    plugins: ['./lib/plugins.js'],
    promise: ['./lib/promise.js'],
    scan: ['./lib/scan.js'],
    shell: ['./lib/shell.js'],
    updates: ['./lib/updates.js'],
    user: ['./lib/user.js'],
    yaml: ['./lib/yaml.js'],
  },
};

// Clean up
log.info('Going to clean %j', dest);
fs.emptyDirSync(dest);

// Cycle through the docs
return Promise.resolve(_.keys(docs.sections))

// Go through each section
.each(section => {
  return jsdoc2md.getTemplateData({'files': docs.sections[section], 'no-cache': true})

  // Fix "aliases" and then render
  .then(data => _.map(data, datum => util.fixAlias(datum)))

  // Do the render
  .then(data => jsdoc2md.render({
    'data': data,
    'global-index-format': 'none',
  }))

  // Report and collect errors
  .catch(error => {
    errors.push(error.message);
    log.error('ERROR: %', error.message);
  })

  // Write the file if we have data
  .then(data => {
    if (data) {
      const output = path.join(dest, section + '.md');
      log.info('writing ' + output+ '...');
      return fs.outputFile(output, data, error => {
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
});
