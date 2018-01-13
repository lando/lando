#!/usr/bin/env node
'use strict';

/**
 * Constants
 */
const argv = require('yargs').argv,
  fs = require('fs'),
  util = require('./util');
const currentBranch = util.execGitCmd(
  ['rev-parse', '--abbrev-ref', 'HEAD'],
  'Getting current branch'
).trim();

/**
 * Functions
 */

/**
 * Bump the package.json version number and write it back to the file.
 *
 * @param {object} pkgJson package.json contents.
 * @param {string} stage Semver stage identifier (prerelease, patch, minor, major).
 *
 * @return {object} Updated package.json data.
 */
function bumpPkgJson(pkgJson, stage) {
  pkgJson.version = util.setVersion(pkgJson, stage);
  return pkgJson;
}

/**
 * Converts an Git command from an array to a string.
 *
 * @param {array} cmd Git command as array.
 *
 * @returns {string} representation of Git command.
 */
function expandGitCmd(cmd = []) {
 return 'git ' + cmd.join(' ');
}

const pkgJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const newJson = bumpPkgJson(pkgJson, argv.stage);
const commitCmd = ['commit', 'package.json', '-m', 'Release v' + newJson.version],
  pushBranchCmd = ['push', 'origin', currentBranch],
  pushTagCmd = ['push', 'origin', 'v' + newJson.version],
  tagCmd = ['tag', '-a', 'v' + pkgJson.version, '-m', 'Version v' + newJson.version];

/**
 * Do the stuff.
 */
if (argv.dryRun) {
  console.log('Dry-Run: Would have bumped version in package.json to: v' + newJson.version);
  return [commitCmd, tagCmd, pushBranchCmd, pushTagCmd].map(function(cmd) {
    return console.log('Dry-Run: Would have run: ' + expandGitCmd(cmd));
  });
}
else {
  // Bump the version in package.json
  console.log('Bumping Lando to version ' + pkgJson.version);
  fs.writeFile(
    './package.json',
    JSON.stringify(pkgJson, null, 2),
    'utf8',
    function (err) {
      if (err) {
        throw err;
      }
    }
  );
  // Commit, Tag, Push!
  [commitCmd, tagCmd, pushBranchCmd, pushTagCmd].map(function (cmd) {
    return util.execGitCmd(
      cmd,
      'running ' + expandGitCmd(cmd)
    );
  });
}
