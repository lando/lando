'use strict';

// Modules
var _ = require('lodash');
var fs = require('fs-extra');
var path = require('path');
var shell = require('shelljs');

/*
 * Helper to get default engine config
 */
exports.getEngineConfig = function() {

  // Create the default options
  const config = {
    host: '127.0.0.1',
    socketPath: '/var/run/docker.sock'
  };

  // Slight deviation on Windows due to npipe://
  if (process.platform === 'win32') {
    config.socketPath = '//./pipe/docker_engine';
  }

  return config;

};

/*
 * Helper to get location of docker bin directory
 */
exports.getDockerBinPath = function() {
  switch (process.platform) {
    case 'darwin':
      return path.join('/Applications/Docker.app/Contents/Resources', 'bin');
    case 'linux':
      return path.join('/usr/share/lando', 'bin');
    case 'win32':
      var programFiles = process.env.ProgramW6432 || process.env.ProgramFiles;
      return path.join(programFiles + '\\Docker\\Docker\\resources\\bin');
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
    composeBin = shell.which('docker-compose');
  }

  // Return exec based on path
  switch (process.platform) {
    case 'darwin': return composeBin;
    case 'linux': return composeBin;
    case 'win32': return composeBin + '.exe';
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
    dockerBin = shell.which('docker');
  }
  // Return exec based on path
  switch (process.platform) {
    case 'darwin': return dockerBin;
    case 'linux': return dockerBin;
    case 'win32': return dockerBin + '.exe';
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
      if (_.includes(shell.which('systemctl'), 'systemctl')) {
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
