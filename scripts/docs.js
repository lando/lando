#!/usr/bin/env node

'use strict';

const _ = require('lodash');
const errors = [];
const fs = require('fs-extra');
const jsdoc2md = require('jsdoc-to-markdown');
const Log = require('./../lib/logger');
const log = new Log({logLevelConsole: 'debug'});
const path = require('path');
const Promise = require('./../lib/promise');
const util = require('./util');
const dest = path.resolve('docs', 'api');

// Files
const docs = {
  sections: {
    core: [
      './lib/app.js',
      './lib/art.js',
      './lib/cache.js',
      './lib/engine.js',
      './lib/error.js',
      './lib/events.js',
      './lib/factory.js',
      './lib/lando.js',
      './lib/logger.js',
      './lib/plugins.js',
      './lib/promise.js',
      './lib/scan.js',
      './lib/shell.js',
      './lib/table.js',
      './lib/updates.js',
      './lib/user.js',
      './lib/yaml.js',
    ],
  },
  helpers: [
    './docs/helpers/helpers.js',
  ],
  partials: [
    './docs/partials/header.hbs',
    './docs/partials/body.hbs',
  ],
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
