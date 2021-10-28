#!/usr/bin/env node

/*
 * This is a nifty cross platform script that will replace relevant versions
 * in json files with a "dev" version generated with `git describe`
 */

'use strict';

// Grab needed modules
const _ = require('lodash');
const fs = require('fs-extra');
const util = require('util');
const debug = require('debug')('@lando/dev-version');
const exec = util.promisify(require('child_process').exec);

// Get dev version func
async function getDevVersion() {
  return await exec('git describe --tags --always --abbrev=1');
}

// Build new version
return getDevVersion()

// Fail if we dont have a version
.then(result => {
  if (!_.isEmpty(result.stderr)) return Promise.reject('NOPE');
  else return (_.trim(result.stdout.slice(1)));
})

// Write the new version
.then(version => {
  const packageJson = require('./../package.json');
  packageJson.version = version;
  debug('Updating package.json to dev version %s', packageJson.version);
  fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
})

// Catch errors and do stuff so we can break builds when this fails
.catch(error => {
  debug(error);
  process.exit(error.code || 555);
});
