/**
 * Module for interfacing with docker
 *
 * @name engine
 */

'use strict';

// Modules
var _ = require('./node')._;
var config = require('./config');
var daemon = require('./daemon');
var lando = require('./lando')(config);
var url = require('url');

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

  // Set our docker host for compose
  if (config.os.platform === 'linux') {
    config.env.DOCKER_HOST = dockerHost;
  }

  // Verify all DOCKER_* vars are stripped on darwin and windows
  if (config.os.platform === 'darwin' || config.os.platform === 'win32') {
    _.each(config.env, function(value, key) {
      if (_.includes(key, 'DOCKER_')) {
        delete config.env[key];
      }
    });
  }

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
      return this.up();
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
 * @static
 * @method
 * @arg {string} data [optional] - Data to filter containers by.
 * @arg {function} callback - Callback called when the engine query completes.
 * @arg {error} callback.error
 * @arg {boolean} callback.response - Engine query response.
 * @example
 * kbox.engine.list(function(err, containers) {
 *   for (var i = 0; i < containers.length; ++i) {
 *     console.log(containers[i].name);
 *   }
 * });
 */
exports.isRunning = function(data, callback) {

  return verifyDaemonIsReady()
  .then(function() {
    //return engineInstance().call('isRunning', data);
  })
  .nodeify(callback);

};

/**
 * Lists installed containers.
 * @static
 * @method
 * @arg {string} data [optional] - Data to filter containers by.
 * @arg {function} callback - Callback called when the engine query completes.
 * @arg {error} callback.error
 * @arg {Array} callback.containers - An array of container objects.
 * @example
 * kbox.engine.list(function(err, containers) {
 *   for (var i = 0; i < containers.length; ++i) {
 *     console.log(containers[i].name);
 *   }
 * });
 */
exports.list = function(data, callback) {

  // Do some argument processing.
  if (!callback && typeof data === 'function') {
    callback = data;
    data = null;
  }

  // Verify provider is ready.
  return verifyDaemonIsReady()
  // Get list of containers from engine.
  .then(function() {
    //return engineInstance().call('list', data);
  })
  // Return.
  .nodeify(callback);

};

/**
 * Returns whether a container exists or not.
 * @arg {string} data - Data to identify the container.
 * @arg {function} callback - Callback..
 * @arg {error} callback.error
 * @arg {boolean} callback.exists - Whether the container exists or not
 * @example
 *  kbox.engine.exists(CONTAINER_NAME, function(err, exists) {
 *    if (err) {
 *      throw err;
 *    }
 *    else {
 *      console.log('I think, therefore i am.');
 *    }
 *  });
 */
exports.exists = function(data, callback) {

  return verifyDaemonIsReady()
  .then(function() {
    //return engineInstance().call('exists', data);
  })
  .nodeify(callback);

};

/**
 * Inspects a container and returns details.
 * @arg {string} data - Data to id the container to inspect.
 * @arg {function} callback - Callback called when the container has been inspected.
 * @arg {error} callback.error
 * @arg {Object} callback.data - Object containing the containers inspected data.
 * @todo: do we want a docker specific thing in the interface?
 * @todo: this might already be deprecated?
 * @example
 * engine.inspect(dataContainer.name, function(err, data) {
 *  if (err) {
 *    return reject(err);
 *  }
 *  var codeDir = '/' + core.deps.lookup('globalConfig').codeDir;
 *  if (data.Volumes[codeDir]) {
 *    fulfill(data.Volumes[codeDir]);
 *  } else {
 *    fulfill(null);
 *  }
 * });
 */
exports.inspect = function(data, callback) {

  // Verify provider is ready.
  return verifyDaemonIsReady()
  // Inspect the container.
  .then(function() {
    //return engineInstance().call('inspect', data);
  })
  // Return.
  .nodeify(callback);

};

/**
 * Starts a container.
 * @arg {string} data - Data about the container(s) to start.
 * @arg {function} callback - Callback called when the container has been started.
 * @arg {error} callback.error
 * @todo Find a good way to document startOptions, and possibly not make them docker specific.
 * @example
 * engine.start(component.containerId, function(err) {
 *   if (err) {
 *     callback(err);
 *   } else {
 *     events.emit('post-start-component', component, function(err) {
 *       if (err) {
 *         callback(err);
 *       } else {
 *         callback(err);
 *       }
 *     });
 *   }
 * });
 */
exports.start = function(data, callback) {

  // Verify provider is ready.
  return verifyDaemonIsReady()
  // Emit pre engine start event.
  .then(function() {
    return lando.events.emit('pre-engine-start', data);
  })
  // Start container.
  .then(function() {
    //return engineInstance().call('start', data);
  })
  // Emit post engine start event.
  .then(function() {
    return lando.events.emit('post-engine-start', data);
  })
  // Return.
  .nodeify(callback);

};

/**
 * Runs a command in a container, in interactive mode
 * @arg {string} data - Data about the container to run.
 * @arg {function} callback - Callback called when the container has been started.
 * @arg {error} callback.error
 * @example
 * var image = 'kalabox/git:stable';
 * var cmd = ['git', 'status'];
 * kbox.engine.run({image: image, cmd: cmd, startOpts: {}, createOpts: {}, function(err) {
 *   if (err) {
 *     throw err;
 *   }
 *   done();
 * });
 */
exports.run = function(data, callback) {

  // Make sure the provider is ready
  return verifyDaemonIsReady()

  // Emit pre engine run
  .then(function() {
    return lando.events.emit('pre-engine-run', data);
  })
  // Run.
  .then(function() {
    //return engineInstance().call('run', data);
  })
  // Emit post engine rum
  .tap(function(/*response*/) {
    return lando.events.emit('post-engine-run', data);
  })
  // Return our response
  .tap(function(response) {
    return response;
  })
  // Return.
  .nodeify(callback);

};

/**
 * Stops a container.
 * @arg {string} data - Data to ID the container(s) to stop.
 * @arg {function} callback - Callback called when the container has been stopped.
 * @arg {error} callback.error
 * @example
 * kbox.engine.stop(containerId, function(err) {
 *   if (err) {
 *     throw err;
 *   }
 *   console.log('Container stopped!');
 * });
 */
exports.stop = function(data, callback) {

  // Verify provider is ready.
  return verifyDaemonIsReady()
  // Emit pre engine stop event.
  .then(function() {
    return lando.events.emit('pre-engine-stop', data);
  })
  // Stop container.
  .then(function() {
    //return engineInstance().call('stop', data);
  })
  // Emit post engine start event.
  .then(function() {
    return lando.events.emit('pre-engine-stop', data);
  })
  // Return.
  .nodeify(callback);

};

/**
 * Removes a container from the engine.
 * @arg {string} data - Data to ID the container(s) to remove.
 * @arg {function} callback - Callback called when the container(s) has been removed.
 * @arg {error} callback.error
 * @example
 *  kbox.engine.destroy(containerId, function() {
 *   fs.unlinkSync(containerIdFile);
 *   console.log('Removing the codez.');
 *   rmdir(app.config.codeRoot, function(err) {
 *     if (err) {
 *       done(err);
 *     }
 *     else {
 *       done();
 *     }
 *   });
 * });
 */
exports.destroy = function(data, callback) {

  // Verify provider is ready.
  return verifyDaemonIsReady()
  // Emit pre engine remote event.
  .then(function() {
    return lando.events.emit('pre-engine-destroy', data);
  })
  // Remove container.
  .then(function() {
    //return engineInstance().call('destroy', data);
  })
  // Emit post engine remove event.
  .then(function() {
    return lando.events.emit('post-engine-destroy', data);
  })
  // Return.
  .nodeify(callback);

};

/**
 * Pulls or builds images.
 * @arg {Object} data - Data about what to build. @todo: define data better
 * @arg {function} callback - Callback called when the data has been built.
 * @arg {error} callback.error
 * @example
 * kbox.engine.build({name: 'kalabox/syncthing:stable'}, function(err) {
 *   if (err) {
 *     state.status = false;
 *     done(err);
 *   } else {
 *     done();
 *   }
 * });
 *
 * return kbox.engine.build({id: '342', name: 'syncthing'})
 *
 * .then(function() {
 *   // Do stuff
 * })
 *
 * kbox.engine.build({id: 'syncthing', compose: composeDirs}, function(err) {
 *   if (err) {
 *     state.status = false;
 *     done(err);
 *   } else {
 *     done();
 *   }
 * });
 *
 */
exports.build = function(data, callback) {

  // Verify provider is ready.
  return verifyDaemonIsReady()
  // Emit pre engine build event.
  .then(function() {
    return lando.events.emit('pre-engine-build', data);
  })
  // Build image.
  .then(function() {
    //return engineInstance().call('build', data);
  })
  // Emit post engine build event.
  .then(function() {
    return lando.events.emit('pre-engine-build', data);
  })
  // Return.
  .nodeify(callback);

};
