#!/usr/bin/env node

var Download = require('download');
var rimraf = require('rimraf');
var semver = require('semver');
var createBar = require('multimeter')(process);
var path = require('path');
var fs = require('fs');
var merge = require('merge');
var urlModule = require('url');
var Decompress = require('decompress');
var fileExists = require('file-exists');
var chalk = require('chalk');

var v = semver.parse(require('../package.json').version);
var subpatch = require('../package.json').subpatch;
var version = [v.major, v.minor, v.patch, subpatch].join('');

/*
 * Determine package type
 */
var getPkgType = function() {
  switch (process.platform) {
    case 'win32': return 'win64';
    case 'darwin': return 'osx64';
    case 'linux': return 'deb64';
  }
};

function logError(e) {
  console.error(chalk.bold.red((typeof e === 'string') ? e : e.message));
  process.exit(1);
}

function cb(error) {
  if( error != null ) {
    return logError( error )
  }

  process.nextTick(function() {
    process.exit();
  });
}

if (v.prerelease && typeof v.prerelease[0] === 'string') {
  var prerelease = v.prerelease[0].split('-');
  if (prerelease.length > 1) {
    prerelease = prerelease.slice(0, -1);
  }
  version += '-' + prerelease.join('-');
}

if (!getPkgType()) logError('Could not find a compatible version of nw.js to download for your platform.');

var url = [
  'https://raw.githubusercontent.com/jxcore/jxcore-release/master/',
  version,
  'jx_' + getPkgType() + 'v8.zip'
].join('/');

var dest = path.resolve(__dirname, '..', 'bin');
rimraf.sync(dest);

var bar = createBar({ before: url + ' [' });

var total = 0;
var progress = 0;

var parsedUrl = urlModule.parse(url);
var decompressOptions = { strip: 1, mode: '755' };
if( parsedUrl.protocol == 'file:' ) {
  if ( !fileExists(parsedUrl.path) ) {
    logError('Could not find ' + parsedUrl.path);
  }
  new Decompress()
    .src( parsedUrl.path )
    .dest( dest )
    .use( Decompress.zip(decompressOptions) )
    .use( Decompress.targz(decompressOptions) )
    .run( cb );
} else {
  new Download(merge({ extract: true }, decompressOptions))
    .get( url )
    .dest( dest )
    .run( cb );
}
