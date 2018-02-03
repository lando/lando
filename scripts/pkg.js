#!/usr/bin/env node
'use strict';
const argv = require('yargs').argv;
const common = require('../tasks/common');
const  pkg = require('./pkg/functions');

if (argv.stage === 'cli') {
  return pkg.pkgCli();
}
else if (argv.stage === 'full') {
  return pkg.pkgFull(common.system.platform);
}
