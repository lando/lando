#!/usr/bin/env node

'use strict';

/*
 * Constants
 */
const argv = require('yargs').argv;
const fs = require('fs');
const util = require('./util');
const currentBranch = util.execGitCmd(
  ['rev-parse', '--abbrev-ref', 'HEAD'],
  'Getting current branch'
).trim();

/*
 * Bump the package.json version number and write it back to the file.
 */
const bumpPkgJson = (pkgJson, stage) => {
  pkgJson.version = util.setVersion(pkgJson, stage);
  return pkgJson;
};

/*
 * Converts an Git command from an array to a string.
 */
const expandGitCmd = (cmd = []) => {
 return 'git ' + cmd.join(' ');
};

const pkgJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const newJson = bumpPkgJson(pkgJson, argv.stage);
const commitCmd = ['commit', 'package.json', '-m', 'Release v' + newJson.version];
const pushBranchCmd = ['push', 'origin', currentBranch];
const pushTagCmd = ['push', 'origin', 'v' + newJson.version];
const tagCmd = ['tag', '-a', 'v' + pkgJson.version, '-m', 'Version v' + newJson.version];

/*
 * Do the stuff.
 */
if (argv.dryRun) {
  console.log('Dry-Run: Would have bumped version in package.json to: v' + newJson.version);
  return [commitCmd, tagCmd, pushBranchCmd, pushTagCmd].map(cmd => {
    return console.log('Dry-Run: Would have run: ' + expandGitCmd(cmd));
  });
} else {
  // Bump the version in package.json
  console.log('Bumping Lando to version ' + pkgJson.version);
  fs.writeFile('./package.json', JSON.stringify(pkgJson, null, 2), 'utf8', err => {
    if (err) {
      throw err;
    }

    // Commit, Tag, Push!
    [commitCmd, tagCmd, pushBranchCmd, pushTagCmd].map(cmd => {
      return util.execGitCmd(cmd, 'running ' + expandGitCmd(cmd));
    });
  });
}
