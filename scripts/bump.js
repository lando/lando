#!/usr/bin/env node

const util = require('./util');
const semver = require('semver');
const fs = require('fs');

let pkgJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

function setVersion(stage) {
  let current = pkgJson.version;
  switch (stage) {
    case 'prerelease':
      return semver.inc(current, 'prerelease');
      break;
    case 'patch':
      return semver.inc(current, 'patch');
      break;
    case 'minor':
      return semver.inc(current, 'minor');
      break;
    case 'major':
      return semver.inc(current, 'major');
      break;
    default:
      return semver.inc(current, stage);
  }
}

pkgJson.version = setVersion(process.argv[2]);
console.log('Bumping Lando to version ' + pkgJson.version);
fs.writeFile(
  './package.json',
  JSON.stringify(pkgJson, null, 2),
  'utf8',
  (err) => { if (err) { throw err; }}
);

