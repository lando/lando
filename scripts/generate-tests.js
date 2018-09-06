#!/usr/bin/env node

'use strict';

// const _ = require('lodash');
// const argv = require('yargs').argv;
// const fs = require('fs-extra');
const Log = require('./../lib/logger');
const log = new Log({logLevelConsole: 'debug'});
const os = require('os');
const path = require('path');
// const Promise = require('bluebird');
// const Shell = require('./../lib/shell');
// const shell = new Shell(log);
const util = require('./util');

// Get readmes that exist
const readmes = util.findReadmes(path.resolve(__dirname, '..', 'examples'));
log.info('Detected possible test source files: %s', readmes.join(os.EOL));

// Parse README into relevant test metadata
const src = util.parseReadmes(readmes);
console.log(src);

// Determine whether each README is "test ready" eg has the correct sections
// and can be parsed into a test
// log.info('Detected valid test source files: %j', src.join(os.EOL));
