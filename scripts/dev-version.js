#!/usr/bin/env node

/*
 * This is a nifty cross platform script that will replace relevant versions
 * in json files with a "dev" version generated with `git describe`
 */

'use strict';

// Grab needed modules
const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');
const Promise = require('bluebird');
const exec = require('child_process').exec;

// Get the location of the files we need to edit
const files = ['package.json'];

// Start our sacred promise
return new Promise((resolve, reject) => {
  exec('git describe --tags --always --abbrev=1', (error, stdout, stderr) => {
    if (error) {
      reject(new Error('error: ' + error + 'err:' + stderr));
    } else {
      resolve(stdout);
    }
  });
})

// Get the git describe result and parse it
.then(data => _.trim(data.slice(1)))

// Replace the version for our files
.then(newVersion => {
  _.forEach(files, file => {
    const location = path.join(process.cwd(), file);
    const data = require(location);
    data.version = newVersion;
    console.log('Updating %s to dev version %s', file, data.version);
    fs.writeFileSync(location, JSON.stringify(data, null, 2));
  });
})

// Catch errors and do stuff so we can break builds when this fails
.catch(error => {
  process.exit(error.code || 1);
});
