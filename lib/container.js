/**
 * Module to wrap and abstract access to dockerode.
 *
 * @module container
 */

'use strict';

// Modules
var _ = require('./node')._;
var daemon = require('./daemon');
var Dockerode = require('dockerode');
var log = require('./logger');
var Promise = require('./promise');
var shell = require('./shell');

var dockerInstance = new Dockerode(daemon.getEngineConfig());

var _container = this;

/*
 * Convert a docker container to a generic container.
 */
var toGenericContainer = function(dockerContainer) {

  // Get name of docker container.
  var app = dockerContainer.Labels['com.docker.compose.project'];
  var service = dockerContainer.Labels['com.docker.compose.service'];
  var num = dockerContainer.Labels['com.docker.compose.container-number'];
  var run = dockerContainer.Labels['com.docker.compose.oneoff'];
  var lando = dockerContainer.Labels['io.lando.container'] || false;
  var special = dockerContainer.Labels['io.lando.service-container'] || false;

  // Add 'run' the service if this is a oneoff container
  if (run === 'True') {
    service = [service, 'run'].join('_');
  }

  // Make sure we have a boolean
  var isSpecial = (special === 'TRUE') ? true : false;

  // Build generic container.
  return {
    id: dockerContainer.Id,
    service: service,
    name: [app, service, num].join('_'),
    app: (!isSpecial) ? app : undefined,
    kind: (!isSpecial) ? 'app' : 'service',
    lando: (lando === 'TRUE') ? true : false
  };

};

/**
 * Query docker for a list of containers.
 */
exports.list = function(appName) {

  // Query docker for list of containers.
  return Promise.fromNode(function(cb) {
    dockerInstance.listContainers({all: 1}, cb);
  })

  // Make sure we have a timeout.
  .timeout(30 * 1000)

  // Wrap errors.
  .catch(function(err) {
    throw new Error(err, 'Error querying docker for list of containers.');
  })

  // Filter out containers with invalid status
  .filter(function(data) {
    return data.Status !== 'Removal In Progress';
  })

  // Map docker containers to generic containers.
  .map(toGenericContainer)

  // Filter out nulls and undefineds.
  .filter(_.identity)

  // Filter out all non-lando containers
  .filter(function(data) {
    return data.lando === true;
  })

  // Filter by app name if an app name was given.
  .then(function(containers) {
    if (appName) {
      return Promise.filter(containers, function(container) {
        return container.app === appName;
      });
    }
    else {
      return containers;
    }
  });

};

/*
 * Find a generic container.
 */
var findGenericContainer = function(cid) {

  // Get list of generic containers.
  return _container.list()

  // Filter by container id and container name.
  .filter(function(container) {
    return container.id === cid || container.name === cid;
  })

  // Return head on results.
  .then(function(results) {
    return _.head(results);
  });

};

/**
 * Find a docker container.
 */
var findContainer = function(cid) {

  // Find a generic container.
  return findGenericContainer(cid)
  .then(function(container) {
    if (container) {
      return dockerInstance.getContainer(container.id);
    }
    else {
      return undefined;
    }
  });

};

/*
 * Find a docker container and throw error if it does not exist.
 */
var findContainerThrows = function(cid) {

  if (typeof cid !== 'string') {
    throw new Error('Invalid container id: "%s"', cid);
  }

  // Find container.
  return findContainer(cid)

  // Throw an error if a container was not found.
  .tap(function(container) {
    if (!container) {
      throw new Error('The container ' + cid + ' does not exist!');
    }
  });

};

/**
 * Inspect a container.
 */
exports.inspect = function(cid) {

  // Find a container.
  return findContainerThrows(cid)
  // Inspect container.
  .then(function(container) {
    // Make sure to retry call to inspect.
    return Promise.fromNode(function(cb) {
      container.inspect(cb);
    });
  })
  // Wrap errors.
  .catch(function(err) {
    throw new Error(err, 'Error inspecting container: %s.', cid);
  });
};

/**
 * Return true if the container is running otherwise false.
 */
exports.isRunning = function(cid) {
  // Validate input.
  return Promise.try(function() {
    if (typeof cid !== 'string') {
      throw new Error('Invalid cid: ' + cid);
    }
  })
  // Inspect.
  .then(function() {
    return _container.inspect(cid);
  })
  .then(function(data) {
    return _.get(data, 'State.Running', false);
  })
  // If the container no longer exists, return false since it isn't running.
  // This will prevent a race condition from happening.
  // Wrap errors.
  .catch(function(err) {
    var expected = 'The container "\'' + cid + '\'" does not exist!';
    if (_.endsWith(err.message, expected)) {
      return false;
    } else {
      // Wrap errors.
      throw new Error(err, 'Error querying isRunning: "%s".', cid);
    }
  });
};

/**
 * Stop a container.
 */
exports.stop = function(cid) {

  // Find and bind container.
  return findContainerThrows(cid)
  .bind({})
  .then(function(container) {
    this.container = container;
  })
  // Check if container is running.
  .then(function() {
    return _container.isRunning(cid);
  })
  // Stop container if it is running.
  .then(function(isRunning) {
    var self = this;
    if (isRunning) {
      return Promise.fromNode(function(cb) {
        self.container.stop(cb);
      });
    }
  })
  // Wrap errors.
  .catch(function(err) {
    throw new Error(err, 'Error stopping container %s.', cid);
  });

};

/**
 * Do a docker exec
 */
exports.run = function(id, cmd, opts) {

  // Discover the mode
  var mode = (opts && opts.mode) ? opts.mode : 'collect';

  // Make cmd is an array lets desconstruct and escape
  if (_.isArray(cmd)) {
    cmd = shell.escSpaces(shell.esc(cmd), 'linux');
  }

  // Add in any prefix commands
  if (_.has(opts, 'pre')) {
    cmd = [opts.pre, cmd].join('&&');
  }

  // Build the exec opts
  var execOpts = {
    AttachStdin: opts.attachStdin || false,
    AttachStdout: opts.attachStdout || true,
    AttachStderr: opts.attachStderr || true,
    Cmd: ['/bin/sh', '-c', cmd],
    Env: opts.env || [],
    DetachKeys: opts.detachKeys || 'ctrl-p,ctrl-q',
    Tty: opts.tty || true,
    User: opts.user || 'root'
  };

  // Force attach stdin if we are in attach mode
  if (mode === 'attach') {
    execOpts.AttachStdin = true;
  }

  // Find a container.
  return findContainerThrows(id)

  // Setup the exec.
  .then(function(container) {
    return Promise.fromNode(function(cb) {
      container.exec(execOpts, cb);
    });
  })

  // Do the crazy
  .then(function(exec) {

    // Start ops
    var startOpts = {
      hijack: opts.hijack || false,
      stdin: execOpts.AttachStdin,
      Detach: false,
      Tty: true
    };

    // Log
    log.verbose('Exec %s on %s in mode %s', cmd, id, mode);
    log.debug('With opts %j %j', execOpts, startOpts);

    // Start it up
    return Promise.fromNode(function(cb) {
      exec.start(startOpts, cb);
    })

    // Cross the streams
    .then(function(stream) {

      // Pipe stream to nodes process
      stream.pipe(process.stdout);

      // Attaching mode handling
      if (mode === 'attach') {

        // Set a more realistic max listeners considering what we are doing here
        process.stdin._maxListeners = 15;

        // Restart stdin with correct encoding
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        // Make sure rawMode matches up
        if (process.stdin.setRawMode) {
          process.stdin.setRawMode(true);
        }

        // Send our processes stdin into the container
        process.stdin.pipe(stream);

      }

      // Promise in the stream
      return new Promise(function(resolve) {

        // Collector for buffer
        var stdOut = '';
        var stdErr = '';

        // Collect the buffer if in collect mode
        stream.on('data', function(buffer) {
          stdOut = stdOut + String(buffer);
        });

        // Collect the errorz
        stream.on('error', function(buffer) {
          stdErr = stdErr + String(buffer);
        });

        // Close the stream
        stream.on('end', function() {

          // If we were attached to our processes stdin then close that down
          if (mode === 'attach') {
            if (process.stdin.setRawMode) {
              process.stdin.setRawMode(false);
            }
            process.stdin.pause();
          }

          // Resolve
          resolve({stdOut: stdOut, stdErr: stdErr});

        });

      });

    })

    // Inspect the exec and determine the rejection
    .then(function(data) {

      // Inspect the exec
      return Promise.fromNode(function(cb) {
        exec.inspect(cb);
      })

      // Determine whether we can reject or not
      .then(function(result) {

        // Log
        log.verbose('Exec %s completed', cmd);
        log.debug('With result', result);

        // Return the promiise
        return new Promise(function(resolve, reject) {
          if (result.ExitCode === 0) {
            resolve(data.stdOut);
          }
          else {
            reject({message: data.stdErr || data.stdOut, code:result.ExitCode});
          }
        });
      });

    });

  });

};

/**
 * Remove a container.
 */
exports.remove = function(cid, opts) {

  // Some option handling.
  opts = opts || {};
  opts.v = _.get(opts, 'v', true);
  opts.force = _.get(opts, 'force', false);

  // Find a container or throw an error.
  return findContainerThrows(cid)

  // Do stuff with the container
  // @todo: this is kind of sloppy for now
  .then(function(container) {

    // Stop the container if it's running. Unless we are in force mode
    if (!opts.force) {
      return (_container.isRunning(cid))
      .then(function(isRunning) {
        if (isRunning) {
          return Promise.fromNode(container.stop);
        }
        else {
          return container;
        }
      });
    }

    // Return the continer to eliminate
    else {
      return container;
    }
  })

  // Remove the container.
  .then(function(container) {
    return Promise.fromNode(function(cb) {
      container.remove(opts, cb);
    });
  })

  // Wrap errors.
  .catch(function(err) {
    throw new Error(err, 'Error removing container %s.', cid);
  });

};
