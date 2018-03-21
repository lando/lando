/**
 * This is a nifty cross platform script that will replace relevant versions
 * in json files with a "dev" version generated with `git describe`
 */

'use strict';

// Grab needed modules
var _ = require('lodash');
var fs = require('fs-extra');
var path = require('path');
var Promise = require('bluebird');
var exec = require('child_process').exec;

// Get the location of the files we need to edit
var files = ['package.json'];

// Start our sacred promise
return new Promise(function(resolve, reject) {
  exec('git describe --tags --always --abbrev=1', function(error, stdout, stderr) {
    if (error) {
      reject(new Error('error: ' + error + 'err:' + stderr));
    }
    else {
      resolve(stdout);
    }
  });
})

// Get the git describe result and parse it
.then(function(data) {
  return _.trim(data.slice(1));
})

// Replace the version for our files
.then(function(newVersion) {
  _.forEach(files, function(file) {
    var location = path.join(process.cwd(), file);
    var data = require(location);
    data.version = newVersion;
    console.log('Updating %s to dev version %s', file, data.version);
    fs.writeFileSync(location, JSON.stringify(data, null, 2));
  });
})

// Catch errors and do stuff so we can break builds when this fails
.catch(function(error) {
  process.exit(error.code || 1);
});
