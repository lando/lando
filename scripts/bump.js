#!/usr/bin/env node

'use strict';

// Modules and stuffs
const _ = require('lodash');
const argv = require('yargs').argv;
const fs = require('fs-extra');
const Log = require('./../lib/logger.');
const log = new Log({logLevelConsole: 'debug'});
const Shell = require('./../lib/shell');
const shell = new Shell(log);
const util = require('./util');
const packageJson = require('./../package.json');
const currentVersion = packageJson.version;
const Promise = require('bluebird');
const newVersion = util.bumpVersion(currentVersion, argv.type);

const deploy = {
  commit: ['git', 'commit', 'package.json', '-m', 'Release v' + newVersion],
  tag: ['git', 'tag', '-a', 'v' + newVersion, '-m', 'Version v' + newVersion],
  pushTag: ['git', 'push', 'origin', 'v' + newVersion],
};

// Kick if off
log.info('Trying to get current branch');
return shell.sh(['git', 'rev-parse', '--abbrev-ref', 'HEAD'], {mode: 'collect'})

// Determine the current branch
.then(output => {
  deploy.pushBranch = ['git', 'push', 'origin', _.trim(output)];
  log.info('Current branch is %s', _.last(deploy.pushBranch));
})

// The meat of things
.then(() => {
  if (argv.dryRun) {
    log.info('Dry-Run: Would have bumped version in package.json to: v%s', newVersion);
    _.forEach(deploy, cmd => {
      log.info('Dry-Run: Would have run: %s', cmd.join(' '));
    });
  } else {
    log.info('Bumping Lando to version ' + packageJson.version);
    // Build new package.json
    const newPackageJson = _.merge({}, packageJson, {version: newVersion});
    // Write the new version
    fs.writeFileSync('./package.json', JSON.stringify(newPackageJson, null, 2));
    // Run all the git commands
    return Promise.resolve(_.values(deploy)).each(cmd => shell.sh(cmd, {mode: 'collect'}));
  }
})

// Catch errors and exit
.catch(err => {
  log.error(err);
  process.exit(4);
});
