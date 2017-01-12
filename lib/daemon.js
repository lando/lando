/**
 * Module to interact with docker daemon
 *
 * @name daemon
 */

'use strict';

// Modules
var config = require('./config');
var shell = require('./shell');
var log = require('./logger');
var Promise = require('./promise');

// Get our docker engine executable
var DOCKER_EXECUTABLE = config.dockerBin;

/*
 * Get services wrapper
 */
var getServicesWrapper = function(cmd) {

  // Return file(s) we need to check for
  switch (process.platform) {
    case 'darwin':
      return ['open', '/Applications/Docker.app'];
    case 'linux':
      return ['sudo', 'service', 'kalabox'].concat(cmd);
    case 'win32':
      var base = process.env.ProgramW6432;
      var dockerBin = base + '\\Docker\\Docker\\Docker for Windows.exe';
      return ['cmd', '/C', dockerBin];
  }

};

/*
 * Run a services command in a shell.
 */
var serviceCmd = function(cmd, opts) {

  // Retry
  return Promise.retry(function() {

    // Run the command
    return shell.sh(getServicesWrapper(cmd), opts)

    // Throw an error
    .catch(function(err) {
      throw new Error(err);
    });

  });

};

/*
 * Return true if engine is up.
 */
exports.isUp = function() {

  // Whitelist this in windows for now
  return shell.sh([DOCKER_EXECUTABLE, 'info'], {mode: 'collect'})

  // Return true if we get a zero response
  .then(function() {
    log.info('Engine is up.');
    return Promise.resolve(true);
  })

  // Return false if we get a non-zero response
  .catch(function() {
    log.info('Engine is down.');
    return Promise.resolve(false);
  });

};

/*
 * Return true if engine is down.
 */
exports.isDown = function() {

  // Return the opposite of isUp.
  return this.isUp()
  .then(function(isUp) {
    return !isUp;
  });

};

/*
 * Bring engine up.
 */
exports.up = function() {

  // Automatically return true if we are in the GUI and on linux because
  // this requires SUDO and because the daemon should always be running on nix
  if (config.mode === 'gui' && process.platform === 'linux') {
    return Promise.resolve(true);
  }

  // Get status
  return this.isDown()

  // Only start if we aren't already
  .then(function(isDown) {
    if (isDown) {
      log.info('Trying to start engine.');
      var opts = (process.platform === 'win32') ? {detached: true} : {};
      return serviceCmd(['start'], opts);
    }
  })

  // Wait for the daemon to respond
  .retry(function() {
    log.verbose('Trying to connect to daemon.');
    return shell.sh([DOCKER_EXECUTABLE, 'info'], {mode: 'collect'});
  }, {max: 25, backoff: 1000})

  // Engine is good!
  .then(function() {
    log.info('Engine activated.');
  })

  // Wrap errors.
  .catch(function(err) {
    throw new Error(err, 'Error bringing daemon up.');
  });

};

/*
 * Bring engine down.
 */
exports.down = function() {

  // Automatically return true if we are in the GUI and on linux because
  // this requires SUDO and because the daemon should always be running on nix
  if (config.mode === 'gui' && process.platform === 'linux') {
    return Promise.resolve(true);
  }

  // Automatically return if we are on Windows or Darwin because we don't
  // ever want to automatically turn the VM off since users might be using
  // D4M/W for other things.
  //
  // For now we will be shutting down any services via relevant event hooks
  // that bind to critical/common ports on 127.0.0.1/localhost e.g. 80/443/53
  //
  // @todo: When/if we can run our own isolated docker daemon we can change
  // this back.
  if (process.platform === 'win32' || process.platform === 'darwin') {
    return Promise.resolve(true);
  }

  // Get provider status.
  return this.isUp()

  // Shut provider down if its status is running.
  .then(function(isUp) {
    if (isUp) {
      // Retry to shutdown if an error occurs.
      return serviceCmd(['stop'], {mode: 'collect'});
    }
  })

  // Wrap errors.
  .catch(function(err) {
    throw new Error(err, 'Error while shutting down.');
  });

};

/*
 * Return true if engine is installed.
 */
exports.isInstalled = function() {

  // Return whether we have the engine executable in the expected location
  var which = shell.which(DOCKER_EXECUTABLE);
  if (which.toUpperCase() === DOCKER_EXECUTABLE.toUpperCase()) {
    return Promise.resolve(true);
  }

  // We are not installed
  return Promise.resolve(false);

};

/*
 * Return cached instance of engine config.
 */
exports.getEngineConfig = function() {

  // Return the correct config
  switch (process.platform) {
    case 'darwin':
      return {
        host: '127.0.0.1',
        socketPath: '/var/run/docker.sock'
      };
    case 'linux':
      return {
        host: '10.13.37.100',
        port: '2375'
      };
    case 'win32':
      return {
        host: '127.0.0.1',
        port: '2375'
      };
  }

};

/*
 * Return engine's IP address.
 */
exports.getIp = function() {
  return this.getEngineConfig().host;
};

/*
 * This should be the same on macOS and Linux, win needs a little extra
 * magic
 */
exports.path2Bind4U = function(path) {
  var bind = path;
  if (process.platform === 'win32') {
    bind = path.replace(/\\/g, '/').replace('C:/', 'c:/');
  }
  return bind;
};
