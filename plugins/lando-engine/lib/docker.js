'use strict';

// Get the docker config
module.exports = config => {
  // Modules
  const _ = require('lodash');
  const Dockerode = require('dockerode');
  const esc = require('shell-escape');
  const Promise = require('./../../../lib/promise');
  const utils = require('./utils');

  // Spin up the docker instance
  const dockerInstance = new Dockerode(config);

  /*
   * Convert a docker container to a generic container.
   */
  const toGenericContainer = dockerContainer => {
    // Get name of docker container.
    const app = dockerContainer.Labels['com.docker.compose.project'];
    const service = dockerContainer.Labels['com.docker.compose.service'];
    const num = dockerContainer.Labels['com.docker.compose.container-number'];
    const run = dockerContainer.Labels['com.docker.compose.oneoff'];
    const lando = dockerContainer.Labels['io.lando.container'] || false;
    const special = dockerContainer.Labels['io.lando.service-container'] || false;
    const id = dockerContainer.Labels['io.lando.id'] || 'unknown';

    // Add 'run' the service if this is a oneoff container
    if (run === 'True') service = [service, 'run'].join('_');

    // Make sure we have a boolean
    const isSpecial = (special === 'TRUE') ? true : false;

    // Build generic container.
    return {
      id: dockerContainer.Id,
      service: service,
      name: [app, service, num].join('_'),
      app: (!isSpecial) ? app : undefined,
      kind: (!isSpecial) ? 'app' : 'service',
      lando: (lando === 'TRUE') ? true : false,
      instance: id,
    };
  };

  /*
   * Query docker for a list of containers.
   */
  const list = appName => Promise.fromNode(cb => {
      dockerInstance.listContainers({all: 1}, cb);
    })

    // Make sure we have a timeout.
    .timeout(30 * 1000)

    // Wrap errors.
    .catch(err => {
      throw new Error(err, 'Error querying docker for list of containers.');
    })

    // Filter out containers with invalid status
    .filter(data => data.Status !== 'Removal In Progress')

    // Map docker containers to generic containers.
    .map(toGenericContainer)

    // Filter out nulls and undefineds.
    .filter(_.identity)

    // Filter out all non-lando containers
    .filter(data => data.lando === true)

    // Filter by app name if an app name was given.
    .then(containers => (appName) ? _.filter(containers, container => container.app === appName) : containers);

  /*
   * Find a generic container.
   */
  const findGenericContainer = cid => list()
    // Filter by container id and container name.
    .filter(container => container.id === cid || container.name === cid)
    // Return head on results.
    .then(results => _.head(results));

  /*
   * Find a docker container.
   */
  const findContainer = cid => findGenericContainer(cid)
    .then(container => (container) ? dockerInstance.getContainer(container.id) : undefined);

  /*
   * Find a docker container and throw error if it does not exist.
   */
  const findContainerThrows = cid => {
    if (typeof cid !== 'string') {
      throw new Error('Invalid container id: "%s"', cid);
    }

    // Find container.
    return Promise.retry(() => findContainer(cid)
    // Throw an error if a container was not found.
    .tap(container => {
      if (!container) throw new Error('The container ' + cid + ' does not exist!');
    }));
  };

  /*
   * Inspect a container.
   */
  const inspect = cid => findContainerThrows(cid)
    // Inspect container.
    .then(container => container.inspect())
    // Wrap errors.
    .catch(err => {
      throw new Error(err, 'Error inspecting container: %s.', cid);
    });

  /*
   * Return true if the container is running otherwise false.
   */
  const isRunning = cid => {
    if (typeof cid !== 'string') throw new Error('Invalid cid: ' + cid);

    // Inspect.
    return inspect(cid)
    // Get the runnign state
    .then(data => _.get(data, 'State.Running', false))
    // If the container no longer exists, return false since it isn't running.
    // This will prevent a race condition from happening.
    // Wrap errors.
    .catch(err => {
      if (_.endsWith(err.message, 'The container "\'' + cid + '\'" does not exist!')) return false;
      else throw new Error(err, 'Error querying isRunning: "%s".', cid);
    });
  };

  /*
   * Stop a container.
   */
  const stop = cid => findContainerThrows(cid)
    // Check if container is running.
    .then(container => isRunning(container.id))
    // Stop container if it is running.
    .then(isRunning => {
      if (isRunning) return container.stop();
    })
    // Wrap errors.
    .catch(err => {
      throw new Error(err, 'Error stopping container %s.', cid);
    });

  /*
   * Do a docker exec
   */
  const run = (id, cmd, opts = {}) => {
    // Discover the mode
    const mode = (opts.mode) ? opts.mode : 'collect';
    const defaultTty = true;
    // Force some things things if we are in a non node context
    if (process.lando !== 'node') {
      mode = 'collect';
      defaultTty = false;
    }

    // Make cmd is an array lets desconstruct and escape
    if (_.isArray(cmd)) cmd = utils.escSpaces(esc(cmd), 'linux');
    // Add in any prefix commands
    if (_.has(opts, 'pre')) cmd = [opts.pre, cmd].join('&&');

    // Build the exec opts
    const execOpts = {
      AttachStdin: opts.attachStdin || false,
      AttachStdout: opts.attachStdout || true,
      AttachStderr: opts.attachStderr || true,
      Cmd: ['/bin/sh', '-c', cmd],
      Env: opts.env || [],
      DetachKeys: opts.detachKeys || 'ctrl-p,ctrl-q',
      Tty: opts.tty || defaultTty,
      User: opts.user || 'root',
    };

    // Start opts
    const startOpts = {
      hijack: opts.hijack || false,
      stdin: execOpts.AttachStdin,
      Detach: false,
      Tty: defaultTty,
    };

    // Force attach stdin if we are in attach mode
    if (mode === 'attach') execOpts.AttachStdin = true;

    // Find a container.
    return findContainerThrows(id)

    // Setup the exec.
    .then(container => Promise.fromNode(cb => {
      container.exec(execOpts, cb);
    }))

    // Do the crazy
    .then(exec => Promise.fromNode(cb => {
      exec.start(startOpts, cb);
    })

    // Cross the streams
    .then(stream => {
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
      return new Promise(resolve => {
        let stdout = '';
        let stderr = '';
        // Collect the buffer if in collect mode
        stream.on('data', buffer => {
          stdout = stdout + String(buffer);
        });

        // Collect the errorz
        stream.on('error', buffer => {
          stderr = stderr + String(buffer);
        });

        // Close the stream
        stream.on('end', () => {
          // If we were attached to our processes stdin then close that down
          if (mode === 'attach') {
            if (process.stdin.setRawMode) process.stdin.setRawMode(false);
            process.stdin.pause();
          }
          // Resolve
          resolve({stdout, stderr});
        });
      });
    })

    // Inspect the exec and determine the rejection
    .then(data => Promise.fromNode(cb => {
      exec.inspect(cb);
    })

    // Determine whether we can reject or not
    .then(result => new Promise((resolve, reject) => {
      if (result.ExitCode === 0) resolve(data.stdout);
      else reject({message: data.stderr || data.stderr, code: result.ExitCode});
    }))));
  };

  /*
   * Remove a container.
   */
  const remove = (cid, opts = {v: true, force: false}) => findContainerThrows(cid)
    // Remove the container.
    .then(container => Promise.fromNode(cb => {
      container.remove(opts, cb);
    }))
    // Wrap errors.
    .catch(function(err) {
      throw new Error(err, 'Error removing container %s.', cid);
    });

  /*
   * Prune the networks
   */
  const createNetwork = (name, opts = {}) => dockerInstance.createNetwork(_.merge({}, opts, {Name: name}))
    // Wrap errors.
    .catch(function(err) {
      throw new Error(err, 'Error creating network.');
    });

  /*
   * Get the networks
   */
  const getNetworks = (opts = {}) => dockerInstance.listNetworks(opts)
    // Wrap errors.
    .catch(err => {
      throw new Error(err, 'Error querying docker for list of networks.');
    });

  /*
   * Get a network
   */
  const getNetwork = id => dockerInstance.getNetwork(id);

  // Return
  return {
    list: list,
    inspect: inspect,
    isRunning: isRunning,
    stop: stop,
    run: run,
    remove: remove,
    createNetwork: createNetwork,
    getNetwork: getNetwork,
    getNetworks: getNetworks,
  };
};
