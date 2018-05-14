'use strict';

// Modules
var _ = require('lodash');
var fs = require('fs-extra');
var path = require('path');
var shell = require('shelljs');

/*
 * Helper to get location of docker bin directory
 */
exports.getDockerBinPath = function() {
  switch (process.platform) {
    case 'darwin':
      return '/Applications/Docker.app/Contents/Resources/bin';
    case 'linux':
      return '/usr/share/lando/bin';
    case 'win32':
      var programFiles = process.env.ProgramW6432 || process.env.ProgramFiles;
      return path.win32.join(programFiles + '\\Docker\\Docker\\resources\\bin');
  }
};

/*
 * Get docker compose binary path
 */
exports.getComposeExecutable = function() {

  // Get compose bin path
  var composePath = exports.getDockerBinPath();
  var composeBin = path.join(composePath, 'docker-compose');

  // Use PATH compose executable on linux if ours does not exist
  if (process.platform === 'linux' && !fs.existsSync(composeBin)) {
    composeBin = _.toString(shell.which('docker-compose'));
  }

  // Return exec based on path
  switch (process.platform) {
    case 'darwin': return path.posix.normalize(composeBin);
    case 'linux': return path.posix.normalize(composeBin);
    case 'win32': return path.win32.normalize(composeBin + '.exe');
  }

};

/*
 * This should only be needed for linux
 */
exports.getDockerExecutable = function() {

  // Get docker bin path
  var isLinux = process.platform === 'linux';
  var dockerPath = (isLinux) ? '/usr/bin' : exports.getDockerBinPath();
  var dockerBin = path.join(dockerPath, 'docker');

  // Use PATH docker executable on linux if ours does not exist
  if (process.platform === 'linux' && !fs.existsSync(dockerBin)) {
    dockerBin = _.toString(shell.which('docker'));
  }
  // Return exec based on path
  switch (process.platform) {
    case 'darwin': return path.posix.normalize(dockerBin);
    case 'linux': return path.posix.normalize(dockerBin);
    case 'win32': return path.win32.normalize(dockerBin + '.exe');
  }

};

/*
 * Get services wrapper
 */
exports.buildDockerCmd = function(cmd) {

  // Return file(s) we need to check for
  switch (process.platform) {
    case 'darwin':
      return ['open', '/Applications/Docker.app'];
    case 'linux':
      if (_.includes(_.toString(shell.which('systemctl')), 'systemctl')) {
        return ['sudo', 'systemctl', cmd, 'docker'];
      }
      else {
        return ['sudo', 'service', 'docker'].concat(cmd);
      }
    case 'win32':
      var base = process.env.ProgramW6432 || process.env.ProgramFiles;
      var dockerBin = base + '\\Docker\\Docker\\Docker for Windows.exe';
      return ['cmd', '/C', dockerBin];
  }

};
