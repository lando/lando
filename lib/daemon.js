/**
 * Module to interact with docker daemon
 *
 * @module daemon
 */

'use strict';

// Modules
var config = require('./config');
var cache = require('./cache');
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
      return ['sudo', 'service', 'docker'].concat(cmd);
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

  // Check out cache for upness first
  if (cache.get('engineUp') === true) {
    return Promise.resolve(true);
  }

  // Whitelist this in windows for now
  return shell.sh([DOCKER_EXECUTABLE, 'info'])

  // Return true if we get a zero response and cache the result
  .then(function() {
    log.debug('Engine is up.');
    cache.set('engineUp', true, {ttl: 5});
    return Promise.resolve(true);
  })

  // Return false if we get a non-zero response
  .catch(function() {
    log.debug('Engine is down.');
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
      log.warn('Attempting to start engine...');
      var opts = (process.platform === 'win32') ? {detached: true} : {};
      return serviceCmd(['start'], opts);
    }
  })

  // Wait for the daemon to respond
  .retry(function() {
    log.warn('Trying to connect to daemon...');
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

  // Create the default options
  var config = {
    host: '127.0.0.1',
    socketPath: '/var/run/docker.sock'
  };

  // Slight deviation on Windows due to npipe://
  if (process.platform === 'win32') {
    config.socketPath = '//./pipe/docker_engine';
  }

  // Return the config
  return config;

};

/*
 * Return engine's IP address.
 */
exports.getIp = function() {
  return this.getEngineConfig().host;
};
