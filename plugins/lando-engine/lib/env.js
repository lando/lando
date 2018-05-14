'use strict';

// Modules
var _ = require('lodash');
var fs = require('fs-extra');
var path = require('path');
var shell = require('shelljs');

/*
 * Helper to get an executable
 */
var getDockerBin = function(bin, base) {

  // Use the correct joiner
  var join = (process.platform === 'win32') ? path.win32.join : path.posix.join;

  // Get compose bin path
  var binPath = join(base, bin);

  // Use PATH compose executable on linux if ours does not exist
  if (process.platform === 'linux' && !fs.existsSync(binPath)) {
    binPath = _.toString(shell.which(bin));
  }

  // Return exec based on path
  switch (process.platform) {
    case 'darwin': return path.posix.normalize(binPath);
    case 'linux': return path.posix.normalize(binPath);
    case 'win32': return path.win32.normalize(binPath + '.exe');
  }

};

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
  return getDockerBin('docker-compose', exports.getDockerBinPath());
};

/*
 * This should only be needed for linux
 */
exports.getDockerExecutable = function() {
  var isLinux = process.platform === 'linux';
  var base = (isLinux) ? '/usr/bin' : exports.getDockerBinPath();
  return getDockerBin('docker', base);
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
