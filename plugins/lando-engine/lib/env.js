'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');
const shell = require('shelljs');
const url = require('url');

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

// Helper setting docker host
const setDockerHost = (hostname, port = 2376) => url.format({
  protocol: 'tcp',
  slashes: true,
  hostname,
  port,
});

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

// Helper for engine config
exports.getEngineConfig = ({engineConfig = {}, env}) => {
  // Set defaults if we have to
  if (_.isEmpty(engineConfig)) {
    engineConfig = {
      socketPath: (process.platform === 'win32') ? '//./pipe/docker_engine' : '/var/run/docker.sock',
      host: '127.0.0.1',
      port: 2376,
    };
  }
  // Set the docker host if its non-standard
  if (engineConfig.host !== '127.0.0.1') env.DOCKER_HOST = setDockerHost(engineConfig.host, engineConfig.port);
  // Set the TLS/cert things if needed
  if (_.has(engineConfig, 'certPath')) {
    env.DOCKER_CERT_PATH = engineConfig.certPath;
    env.DOCKER_TLS_VERIFY = 1;
    engineConfig.ca = fs.readFileSync(path.join(env.DOCKER_CERT_PATH, 'ca.pem'));
    engineConfig.cert = fs.readFileSync(path.join(env.DOCKER_CERT_PATH, 'cert.pem'));
    engineConfig.key = fs.readFileSync(path.join(env.DOCKER_CERT_PATH, 'key.pem'));
  }
  // Return
  return engineConfig;
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
