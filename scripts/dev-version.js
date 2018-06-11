#!/usr/bin/env node

/*
 * This is a nifty cross platform script that will replace relevant versions
 * in json files with a "dev" version generated with `git describe`
 */

'use strict';

// Grab needed modules
const _ = require('lodash');
const fs = require('fs-extra');
const Log = require('./../lib/logger');
const log = new Log({logLevelConsole: 'debug'});
const Shell = require('./../lib/shell');
const shell = new Shell(log);

// Start our sacred promise
return shell.sh(['git', 'describe', '--tags', '--always', '--abbrev=1'], {mode: 'collect'})

// Trim the tag
.then(data => _.trim(data.slice(1)))

// Replace the version for our files
.then(version => {
  let packageJson = require('./../package.json');
  packageJson.version = version;
  log.info('Updating package.json to dev version %s', packageJson.version);
  fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
})

// Catch errors and do stuff so we can break builds when this fails
.catch(error => {
  log.error(error);
  process.exit(error.code || 555);
});
