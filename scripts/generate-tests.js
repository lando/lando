#!/usr/bin/env node

'use strict';

const _ = require('lodash');
const fs = require('fs-extra');
const Log = require('./../lib/logger');
const log = new Log({logLevelConsole: 'debug'});
const os = require('os');
const path = require('path');
const util = require('./util');

// Get readmes that exist
const readmes = util.findReadmes(path.resolve(__dirname, '..', 'examples'));
log.info('Detected possible test source files: %s', readmes.join(os.EOL));

// Parse README into relevant test metadata
const tests = util.parseReadmes(readmes);
log.info('Detected valid tests %s', _.map(tests, 'file').join(os.EOL));

// Get the template renderer
const templateFile = path.join('test', 'templates', 'func.test.jst');
const render = util.buildTemplateFunction(templateFile);

// Generate the test files
const testDir = path.join('test', 'func');
_.forEach(tests, test => {
  const dest = path.join(testDir, `${test.id}.spec.js`);
  fs.writeFileSync(dest, render(test));
  log.info('Writing %s test to %s', test.id, dest);
});
