'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');
const shell = require('shelljs');

/*
 * Helper to get an executable
 */
const getDockerBin = (bin, base) => {
  const join = (process.platform === 'win32') ? path.win32.join : path.posix.join;
  let binPath = join(base, bin);

  // Use PATH compose executable on linux if ours does not exist
  if (process.platform === 'linux' && !fs.existsSync(binPath)) {
    binPath = _.toString(shell.which(bin));
  }

  switch (process.platform) {
    case 'darwin': return path.posix.normalize(binPath);
    case 'linux': return path.posix.normalize(binPath);
    case 'win32': return path.win32.normalize(binPath + '.exe');
  }
};

/*
 * Helper to get location of docker bin directory
 */
exports.getDockerBinPath = () => {
  switch (process.platform) {
    case 'darwin':
      return '/Applications/Docker.app/Contents/Resources/bin';
    case 'linux':
      return '/usr/share/lando/bin';
    case 'win32':
      const programFiles = process.env.ProgramW6432 || process.env.ProgramFiles;
      return path.win32.join(programFiles + '\\Docker\\Docker\\resources\\bin');
  }
};

/*
 * Get docker compose binary path
 */
exports.getComposeExecutable = () => getDockerBin('docker-compose', exports.getDockerBinPath());

/*
 * This should only be needed for linux
 */
exports.getDockerExecutable = () => {
  const base = (process.platform === 'linux') ? '/usr/bin' : exports.getDockerBinPath();
  return getDockerBin('docker', base);
};

/*
 * Get services wrapper
 */
exports.buildDockerCmd = cmd => {
  switch (process.platform) {
    case 'darwin':
      return ['open', '/Applications/Docker.app'];
    case 'linux':
      if (_.includes(_.toString(shell.which('systemctl')), 'systemctl')) {
        return ['sudo', 'systemctl', cmd, 'docker'];
      } else {
        return ['sudo', 'service', 'docker'].concat(cmd);
      }
    case 'win32':
      const base = process.env.ProgramW6432 || process.env.ProgramFiles;
      const dockerBin = base + '\\Docker\\Docker\\Docker for Windows.exe';
      return ['cmd', '/C', dockerBin];
  }
};
