/**
 * Module for interfacing with docker
 *
 * @name engine
 */

'use strict';

// Modules
var _ = require('./node')._;
var config = require('./config');
var docker = require('./docker');
var daemon = require('./daemon');
var lando = require('./lando')(config);
var url = require('url');
var _engine = this;

/*
 * Do some additional bootstrapping prep for our engine
 */
lando.events.on('pre-bootstrap', 1, function(config) {

  // Get the docker config
  var engineConfig = daemon.getEngineConfig();

  // Parse the docker host url
  var dockerHost = url.format({
    protocol: 'tcp',
    slashes: true,
    hostname: engineConfig.host,
    port: engineConfig.port
  });

  // Verify all DOCKER_* vars are stripped on darwin and windows
  _.each(config.env, function(value, key) {
    if (_.includes(key, 'DOCKER_')) {
      delete config.env[key];
    }
  });

  // Add some things to our config
  config.engineHost = engineConfig.host;

  // Set some helpful engine env helpers
  config.env.LANDO_ENGINE_ID = config.engineId;
  config.env.LANDO_ENGINE_GID = config.engineGid;
  config.env.LANDO_ENGINE_HOME = daemon.path2Bind4U(config.home);
  config.env.LANDO_ENGINE_IP = dockerHost;
  var remoteIp = (process.platform === 'linux') ? dockerHost : '192.168.65.1';
  config.env.LANDO_ENGINE_REMOTE_IP = remoteIp;

});

/*
 * Throws an error if the provider is not installed.
 */
var verifyDaemonInstalled = function() {

  // Check if daemon is installed.
  return daemon.isInstalled()

  // Throw error if daemon isn't installed.
  .then(function(isInstalled) {
    if (!isInstalled) {
      throw Error('Lando thinks you might need some help with your droid');
    }
  });

};

/*
 * Starts daemon if not up.
 */
var verifyDaemonUp = function() {

  // Query for provider's up status.
  return daemon.isUp()

  // Turn on provider if needed
  .then(function(isUp) {
    if (!isUp) {
      return _engine.up();
    }
  });

};

/*
 * Verify that the daemon is ready.
 */
var verifyDaemonIsReady = function() {

  // Verify provider is installed.
  return verifyDaemonInstalled()
  // Verify provider is up.
  .then(verifyDaemonUp);

};

/**
 * Turns the docker daemon on
 */
exports.up = function() {

  // Verify the provider is already installed.
  return verifyDaemonInstalled()

  // Emit pre engine up event.
  .then(function() {
    return lando.events.emit('pre-engine-up');
  })

  // Bring the provider up.
  .then(function() {
    return daemon.up();
  })

  // Emit post engine create event.
  .then(function() {
    return lando.events.emit('post-engine-up');
  });

};

/**
 * Returns the state of the docker daemon
 */
exports.isUp = function() {
  return daemon.isUp();
};

/**
 * Shuts the docker daemon off.
 */
exports.down = function() {

  // Verify the provider is already installed.
  return verifyDaemonInstalled()

  // Emit pre engine down event.
  .then(function() {
    return lando.events.emit('pre-engine-down');
  })

  // Bring the provider down.
  .then(function() {
    return daemon.down({maxRetries: 3});
  })

  .then(function() {
    return lando.events.emit('post-engine-down');
  });

};

/**
 * Tells you if a container is running.
 */
exports.isRunning = function(data) {

  return verifyDaemonIsReady()
  .then(function() {
    return docker.isRunning(data);
  });

};

/**
 * Lists installed containers.
 */
exports.list = function(data) {

  // Verify provider is ready.
  return verifyDaemonIsReady()

  // Get list of containers from engine.
  .then(function() {
    return docker.list(data);
  });

};

/**
 * Returns whether a container exists or not.
 */
exports.exists = function(data) {

  // Verify provider is ready.
  return verifyDaemonIsReady()

  // Exists
  .then(function() {
    return docker.exists(data);
  });

};

/**
 * Inspects a container and returns details.
 */
exports.inspect = function(data) {

  // Verify provider is ready.
  return verifyDaemonIsReady()

  // Inspect the container.
  .then(function() {
    return docker.inspect(data);
  });

};

/**
 * Starts container(s)
 */
exports.start = function(data) {

  // Verify provider is ready.
  return verifyDaemonIsReady()

  // Emit pre engine start event.
  .then(function() {
    return lando.events.emit('pre-engine-start', data);
  })

  // Start container.
  .then(function() {
    return docker.start(data);
  })

  // Emit post engine start event.
  .then(function() {
    return lando.events.emit('post-engine-start', data);
  });

};

/**
 * Runs a command in a container, in interactive mode
 */
exports.run = function(data) {

  // Make sure the provider is ready
  return verifyDaemonIsReady()

  // Emit pre engine run
  .then(function() {
    return lando.events.emit('pre-engine-run', data);
  })

  // Run.
  .then(function() {
    docker.run(data);
  })

  // Emit post engine rum
  .tap(function(/*response*/) {
    return lando.events.emit('post-engine-run', data);
  })

  // Return our response
  .tap(function(response) {
    return response;
  });

};

/**
 * Stops container(s).
 */
exports.stop = function(data) {

  // Verify provider is ready.
  return verifyDaemonIsReady()

  // Emit pre engine stop event.
  .then(function() {
    return lando.events.emit('pre-engine-stop', data);
  })

  // Stop container.
  .then(function() {
    return docker.stop(data);
  })

  // Emit post engine start event.
  .then(function() {
    return lando.events.emit('pre-engine-stop', data);
  });

};

/**
 * Removes a container from the engine.
 */
exports.destroy = function(data) {

  // Verify provider is ready.
  return verifyDaemonIsReady()

  // Emit pre engine remote event.
  .then(function() {
    return lando.events.emit('pre-engine-destroy', data);
  })

  // Remove container.
  .then(function() {
    return docker.remove(data);
  })

  // Emit post engine remove event.
  .then(function() {
    return lando.events.emit('post-engine-destroy', data);
  });

};

/**
 * Pulls or builds images.
 */
exports.build = function(data) {

  // Verify provider is ready.
  return verifyDaemonIsReady()

  // Emit pre engine build event.
  .then(function() {
    return lando.events.emit('pre-engine-build', data);
  })

  // Build image.
  .then(function() {
    return docker.build(data);
  })

  // Emit post engine build event.
  .then(function() {
    return lando.events.emit('pre-engine-build', data);
  });

};
