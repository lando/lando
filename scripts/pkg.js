#!/usr/bin/env node
'use strict';
const argv = require('yargs').argv;
const pkg = require('./pkg/functions');
const util = require('./util');

if (argv.stage === 'cli') {
  return pkg.pkgCli();
}
else if (argv.stage === 'full') {
  return pkg.pkgFull(util.platform);
}
