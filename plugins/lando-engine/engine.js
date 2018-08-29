'use strict';

// We make this module into a function so we can pass in lando
module.exports = function(lando) {

  // Lando Modules
  var _ = lando.node._;
  var log = lando.log;
  var Promise = lando.Promise;

  // Plugin modules
  var compose = require('./lib/compose');
  var docker = require('./lib/docker')(lando.config.engineConfig);
  var env = require('./lib/env');
  var utils = require('./lib/utils');

  // The path to the docker executable
  var DOCKER_EXECUTABLE = lando.config.dockerBin;
  var COMPOSE_EXECUTABLE = lando.config.composeBin;

  /*
   * Take compose command and opts and run it
   */
  var cc = function(run) {
    return lando.shell.sh([COMPOSE_EXECUTABLE].concat(run.cmd), run.opts);
  };

  /**
   * Determines whether the docker engine is installed or not
   *
   * @since 3.0.0
   * @alias 'lando.engine.isInstalled'
   * @returns {Promise} A Promise with a boolean containing the installed status.
   */
  var isInstalled = function() {

    // Return whether we have the engine executable in the expected location
    var which = _.toString(lando.shell.which(DOCKER_EXECUTABLE));
    if (which.toUpperCase() === DOCKER_EXECUTABLE.toUpperCase()) {
      return Promise.resolve(true);
    }

    // We are not installed
    return Promise.resolve(false);

  };

  /*
   * Throws an error if the provider is not installed.
   */
  var verifyDaemonInstalled = function() {

    // Check if daemon is installed.
    return isInstalled()

    // Throw error if daemon isn't installed.
    .then(function(isInstalled) {
      if (!isInstalled) {
        throw Error('Lando thinks you might need some help with your droid');
      }
    });

  };

  /**
   * Determines whether the docker engine is up or not.
   *
   * @todo Does this need to be publically exposed still?
   *
   * @since 3.0.0
   * @alias 'lando.engine.isUp'
   * @returns {Promise} A Promise with a boolean containing the engine up status.
   * @example
   *
   * // Start the engine if it is not up
   * return lando.engine.isUp()
   *
   * // Check if we need to start
   * .then(function(isUp) {
   *   if (!isUp) {
   *     return lando.engine.up();
   *   }
   * });
   */
  var isUp = function() {

    // Cache key
    var key = 'engineup';

    // Check out cache for upness first
    if (lando.cache.get(key) === true) {
      return Promise.resolve(true);
    }

    // Whitelist this in windows for now
    return lando.shell.sh([DOCKER_EXECUTABLE, 'info'])

    // Return true if we get a zero response and cache the result
    .then(function() {
      lando.log.debug('Engine is up.');
      lando.cache.set(key, true, {ttl: 5});
      return Promise.resolve(true);
    })

    // Return false if we get a non-zero response
    .catch(function(error) {
      lando.log.debug('Engine is down with error %j', error);
      return Promise.resolve(false);
    });

  };


  /**
   * Tries to activate the docker engine/daemon.
   *
   * Generally the engine will be up and active, but if it isn't for whatever reason
   * Lando will try to start it.
   *
   * NOTE: Most commands that require the docker engine to be up will automatically
   * call this anyway.
   *
   * @todo Does this need to be publically exposed still?
   *
   * @since 3.0.0
   * @alias 'lando.engine.up'
   * @fires pre_engine_up
   * @fires post_engine_up
   * @returns {Promise} A Promise.
   * @example
   *
   * // List all the apps
   * return lando.app.list()
   *
   * // Map each app to a summary and print results
   * .map(function(app) {
   *  return appSummary(app)
   *   .then(function(summary) {
   *    console.log(JSON.stringify(summary, null, 2));
   *  });
   * });
   */
  var up = function() {

    // Verify the provider is already installed.
    return verifyDaemonInstalled()

    /**
     * Event that allows you to do some things before the docker engine is booted
     * up.
     *
     * @since 3.0.0
     * @event pre_engine_up
     */
    .then(function() {
      return lando.events.emit('pre-engine-up');
    })

    // Bring the provider up.
    .then(function() {

      // Automatically return true if we are in the GUI and on linux because
      // this requires SUDO and because the daemon should always be running on nix
      if (lando.config.process !== 'node' && process.platform === 'linux') {
        return Promise.resolve(true);
      }

      // Get status
      return isUp()

      // Only start if we aren't already
      .then(function(isUp) {
        if (!isUp) {
          log.warn('Whoops! Lando has detected that Docker is not turned on!');
          log.warn('Give us a few moments while we try to start it up for you');
          var opts = (process.platform === 'win32') ? {detached: true} : {};
          return lando.shell.sh(env.buildDockerCmd('start'), opts);
        }
      })

      // Wait for the daemon to respond
      .retry(function() {
        log.warn('Docker has started but we are waiting for a connection');
        log.warn('You should be good to go momentarily!');
        return lando.shell.sh([DOCKER_EXECUTABLE, 'info'], {mode: 'collect'});
      }, {max: 25, backoff: 1000})

      // Engine is good!
      .then(function() {
        log.info('Engine activated.');
      })

      // Wrap errors.
      .catch(function(err) {
        throw new Error(err, 'Error bringing daemon up.');
      });
    })

    /**
     * Event that allows you to do some things after the docker engine is booted
     * up.
     *
     * @since 3.0.0
     * @event post_engine_up
     */
    .then(function() {
      return lando.events.emit('post-engine-up');
    });

  };

  /**
   * Tries to deactivate the docker engine/daemon.
   *
   * NOTE: Most commands that require the docker engine to be up will automatically
   * call this anyway.
   *
   * @todo Does this need to be publically exposed still?
   *
   * @since 3.0.0
   * @alias 'lando.engine.down'
   * @fires pre_engine_down
   * @fires post_engine_down
   * @returns {Promise} A Promise.
   */
  var down = function() {

    // Verify the provider is already installed.
    return verifyDaemonInstalled()

    /**
     * Event that allows you to do some things after the docker engine is booted
     * up.
     *
     * @since 3.0.0
     * @event pre_engine_down
     */
    .then(function() {
      return lando.events.emit('pre-engine-down');
    })

    // Bring the provider down.
    .then(function() {

      // Automatically return true if we are in the GUI and on linux because
      // this requires SUDO and because the daemon should always be running on nix
      if (lando.config.process !== 'node' && process.platform === 'linux') {
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
          return lando.shell.sh(env.buildDockerCmd('stop'), {mode: 'collect'});
        }
      })

      // Wrap errors.
      .catch(function(err) {
        throw new Error(err, 'Error while shutting down.');
      });

    })

    /**
     * Event that allows you to do some things after the docker engine is booted
     * up.
     *
     * @since 3.0.0
     * @event post_engine_down
     */
    .then(function() {
      return lando.events.emit('post-engine-down');
    });

  };

  /*
   * Starts daemon if not up.
   */
  var verifyDaemonUp = function() {

    // Query for provider's up status.
    return isUp()

    // Turn on provider if needed
    .then(function(isUp) {
      if (!isUp) {
        return up();
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
   * Determines whether a container is running or not
   *
   * @since 3.0.0
   * @alias 'lando.engine.isRunning'
   * @param {String} data - An ID that docker can recognize such as the container id or name.
   * @returns {Promise} A Promise with a boolean of whether the container is running or not
   * @example
   *
   * // Check to see if our app's web service is running
   * return lando.engine.isRunning('myapp_web_1')
   *
   * // Log the running status of the container
   * .then(isRunning) {
   *   lando.log.info('Container %s is running: %s', 'myapp_web_1', isRunning);
   * });
   */
  var isRunning = function(data) {

    return verifyDaemonIsReady()
    .then(function() {
      return Promise.retry(function() {
        return docker.isRunning(data);
      });
    });

  };

  /**
   * Lists all the Lando containers. Optionally filter by app name.
   *
   * @since 3.0.0
   * @alias 'lando.engine.list'
   * @param {String} [data] - An appname to filter the containers by.
   * @returns {Promise} A Promise with an Array of container Objects.
   * @example
   *
   * // List all the lando containers
   * return lando.engine.list()
   *
   * // Log each container
   * .each(function(container) {
   *   lando.log.info(container);
   * });
   */
  var list = function(data) {

    // Verify provider is ready.
    return verifyDaemonIsReady()

    // Get list of containers from engine.
    .then(function() {
      // Validate inputs.
      return Promise.try(function() {
        if (data && typeof data !== 'string') {
          throw new TypeError('Invalid data: ' + data);
        }
      })

      .then(function() {
        return Promise.retry(function() {
          return docker.list(data);
        });
      });
    });

  };

  /**
   * Checks whether a specific service exists or not.
   *
   * There are two ways to check whether a container exists:
   *
   *  1. Using an object with `{id: id}` where `id` is a docker recognizable id
   *  2. Using a `compose` object with `{compose: compose, project: project, opts: opts}`
   *
   * These are detailed more below.
   *
   * **NOTE:** Generally an instantiated `app` object is a valid `compose` object
   *
   * @since 3.0.0
   * @alias 'lando.engine.exists'
   * @param {Object} data - Search criteria, Need eithers an ID or a service within a compose context
   * @param {String} data.id - An id that docker can recognize such as a conatainer hash or name. Can also use `data.name` or `data.cid`.
   * @param {Array} data.compose - An Array of paths to Docker compose files
   * @param {String} data.project - A String of the project name (Usually this is the same as the app name)
   * @param {Object} data.opts - Options on what service to check
   * @param {Array} data.opts.services - An Array of services to check
   * @returns {Promise} A Promise with a Boolean of whether the service exists or not.
   * @example
   *
   * // Check whether a service exists by container id
   * return lando.engine.exists({name: 'myapp_web_1'})
   *
   * // Log whether it exists
   * .then(function(exists) {
   *   lando.log.info('Container exists: %s', exists);
   * });
   *
   * // Check whether a service exists by compose/app object
   * // Assume we have an `app` object called `app` already.
   *
   * // Add the services options
   * var compose = app;
   * compose.opts = {
   *   services: ['web']
   * };
   *
   * // Check existence
   * return lando.engine.exists(compose);
   */
  var exists = function(data) {

    // Verify provider is ready.
    return verifyDaemonIsReady()

    // Exists
    .then(function() {
      return Promise.retry(function() {
        if (data.compose) {
          return cc(compose.getId(data.compose, data.project, data.opts))
          .then(function(id) {
            return !_.isEmpty(id);
          });
        }
        else if (utils.getId(data)) {
            // Get list of containers.
          return list(null)
          .then(function(containers) {

            // Start an ID collector
            var ids = [];

            // Add all relevant ids
            _.forEach(containers, function(container) {
              ids.push(container.id);
              ids.push(container.name);
            });

            // Search set of valid containers for data.
            return _.includes(ids, utils.getId(data));

          });
        }
      });
    });

  };

  /**
   * Returns comprehensive service metadata. This is a wrapper around `docker inspect`.
   *
   * There are two ways to get container metadata:
   *
   *  1. Using an object with `{id: id}` where `id` is a docker recognizable id
   *  2. Using a `compose` object with `{compose: compose, project: project, opts: opts}`
   *
   * These are detailed more below.
   *
   * **NOTE:** Generally an instantiated `app` object is a valid `compose` object
   *
   * @since 3.0.0
   * @alias 'lando.engine.scan'
   * @param {Object} data - Search criteria, Need eithers an ID or a service within a compose context
   * @param {String} data.id - An id that docker can recognize such as a conatainer hash or name. Can also use `data.name` or `data.cid`.
   * @param {Array} data.compose - An Array of paths to Docker compose files
   * @param {String} data.project - A String of the project name (Usually this is the same as the app name)
   * @param {Object} data.opts - Options on what service to scan
   * @param {Array} data.opts.services - An Array of services to scan.
   * @returns {Promise} A Promise with an Object of service metadata.
   * @example
   *
   * // Log scan data using an id
   * return lando.engine.scan({id: '146d321f212d'})
   * .then(function(data) {
   *   lando.log.info('Container data is %j', data);
   * });
   *
   * // Log service data by compose/app object
   * // Assume we have an `app` object called `app` already.
   *
   * // Add the services options
   * var compose = app;
   * compose.opts = {
   *   services: ['web']
   * };
   *
   * // scan the service
   * return lando.engine.scan(compose);
   */
  var scan = function(data) {

    // Verify provider is ready.
    return verifyDaemonIsReady()

    // Inspect the container.
    .then(function() {
      return Promise.retry(function() {
        if (data.compose) {
          return cc(compose.getId(data.compose, data.project, data.opts))
          .then(function(id) {
            if (!_.isEmpty(id)) {
              // @todo: this assumes that the container we want
              // is probably the first id returned. What happens if that is
              // not true or we need other ids for this service?
              var ids = id.split('\n');
              return docker.inspect(_.trim(ids.shift()));
            }
          });
        }
        else if (utils.getId(data)) {
          return docker.inspect(utils.getId(data));
        }
      });
    });

  };

  /**
   * Starts the containers/services for the specified `compose` object.
   *
   * **NOTE:** Generally an instantiated `app` object is a valid `compose` object
   *
   * @since 3.0.0
   * @alias 'lando.engine.start'
   * @fires pre_engine_start
   * @fires post_engine_start
   * @param {Object} data - A `compose` Object or an Array of `compose` Objects if you want to start more than one set of services.
   * @param {Array} data.compose - An Array of paths to Docker compose files
   * @param {String} data.project - A String of the project name (Usually this is the same as the app name)
   * @param {Object} [data.opts] - Options on how to start the `compose` Objects containers.
   * @param {Array} [data.opts.services='all services'] - The services to start.
   * @param {Boolean} [data.opts.background=true] - Start the services in the background.
   * @param {Boolean} [data.opts.recreate=false] - Recreate the services.
   * @param {Boolean} [data.opts.removeOrphans=true] - Remove orphaned containers.
   * @returns {Promise} A Promise.
   * @example
   *
   * // Start up all the containers for given app object `app`
   * return lando.engine.start(app);
   *
   * // Start and recreate specific services for an `app`
   * app.opts = {
   *   recreate: true,
   *   services: ['web', 'database']
   * };
   *
   * return lando.engine.start(app);
   */
  var start = function(data) {

    // Verify provider is ready.
    return verifyDaemonIsReady()

    /**
     * Event that allows you to do some things before a `compose` Objects containers are
     * started
     *
     * @since 3.0.0
     * @event pre_engine_start
     */
    .then(function() {
      return lando.events.emit('pre-engine-start', data);
    })

    // Start container.
    .then(function() {
      return Promise.each(utils.normalizer(data), function(datum) {
        return Promise.retry(function() {
          return cc(compose.start(datum.compose, datum.project, datum.opts));
        });
      });
    })

    /**
     * Event that allows you to do some things after a `compose` Objects containers are
     * started
     *
     * @since 3.0.0
     * @event post_engine_start
     */
    .then(function() {
      return lando.events.emit('post-engine-start', data);
    });

  };

  /**
   * Runs a command on a given service/container. This is a wrapper around `docker exec`.
   *
   * UNTIL the resolution of https://github.com/apocas/docker-modem/issues/83 data needs to also be or be an
   * array of compose objects for this to work correctly on Windows as well. See some of the other engine
   * documentation for what a compose object looks like.
   *
   * @since 3.0.0
   * @alias 'lando.engine.run'
   * @fires pre_engine_run
   * @fires post_engine_run
   * @param {Object} data - A run Object or an Array of run Objects if you want to run more tha one command.
   * @param {String} data.id - The container to run the command on. Must be an id that docker can recognize such as a container hash or name.
   * @param {String} data.cmd - A String of a command or an Array whose elements are the parts of the command.
   * @param {Object} [data.opts] - Options on how to run the command.
   * @param {String} [data.opts.mode='collect'] - Either `collect` or `attach`. Attach will connect to the run `stdin`.
   * @param {String} [data.opts.pre] - A String or Array of additional arguments or options to append to the `cmd` before the user specified args and options are added.
   * @param {Boolean} [data.opts.attachStdin=false] - Attach to the run's `stdin`. Helpful if you think there will be interactive options or prompts.
   * @param {Boolean} [data.opts.attachStdout=true] - Attach to the run's `stdout`. Helpful to determine what the command is doing.
   * @param {Boolean} [data.opts.attachStderr=true] - Attach to the run's `stderr`. Helpful to determine any errors.
   * @param {Array} [data.opts.env=[]] - Additional environmental variables to set for the cmd. Must be in the form `KEY=VALUE`.
   * @param {String} [data.opts.detachKeys='ctrl-p,ctrl-q'] - Keystrokes that will detach the process.
   * @param {Boolean} [data.opts.tty=true] - Allocate a pseudo `tty`.
   * @param {String} [data.opts.user='root'] - The user to run the command as. Can also be `user:group` or `uid` or `uid:gid`.
   * @returns {Promise} A Promise with a string containing the command's output.
   * @example
   *
   * // Run composer install on the appserver container for an app called myapp
   * return lando.engine.run({id: 'myapp_appserver_1', cmd: ['composer', 'install']});
   *
   * // Drop into an interactive bash shell on the database continer for an app called myapp
   * var bashRun = {
   *   id: 'myapp_database_1',
   *   cmd: ['bash'],
   *   opts: {
   *     mode: 'attach'
   *   }
   * };
   *
   * return lando.engine.run(bashRun);
   */
  var run = function(data) {

    // Make sure the provider is ready
    return verifyDaemonIsReady()

    /**
     * Event that allows you to do some things before a command is run on a particular
     * container.
     *
     * @since 3.0.0
     * @event pre_engine_run
     */
    .then(function() {
      return lando.events.emit('pre-engine-run', data);
    })

    // Run.
    .then(function() {
      return Promise.each(utils.normalizer(data), function(datum) {

        // Get the opts
        var opts = datum.opts || {};

        // There is weirdness starting up an exec via the Docker Remote API when
        // accessing the daemon through a named pipe on Windows. Until that is
        // resolved we currently shell the exec out to docker-compose
        //
        // See: https://github.com/apocas/docker-modem/issues/83
        //
        if (process.platform === 'win32') {
          opts.cmd = datum.cmd;
          return cc(compose.run(datum.compose, datum.project, opts));
        }

        // POSIX
        // @todo: now that docker compose exec works in windows maybe we should just do
        // all platforms through docker compose now?
        else {
          return docker.run(datum.id, datum.cmd, opts);
        }

      });
    })

    /**
     * Event that allows you to do some things after a command is run on a particular
     * container.
     *
     * @since 3.0.0
     * @event post_engine_run
     */
    .tap(function() {
      return lando.events.emit('post-engine-run', data);
    })

    // Return our response
    .tap(function(response) {
      return response;
    });

  };

  /**
   * Stops containers for a `compose` object or a particular container.
   *
   * There are two ways to stop containers:
   *
   *  1. Using an object with `{id: id}` where `id` is a docker recognizable id
   *  2. Using a `compose` object with `{compose: compose, project: project, opts: opts}`
   *
   * These are detailed more below.
   *
   * **NOTE:** Generally an instantiated `app` object is a valid `compose` object
   *
   * @since 3.0.0
   * @alias 'lando.engine.stop'
   * @fires pre_engine_stop
   * @fires post_engine_stop
   * @param {Object} data - Stop criteria, Need eithers an ID or a service within a compose context
   * @param {String} data.id - An id that docker can recognize such as a container hash or name. Can also use `data.name` or `data.cid`.
   * @param {Array} data.compose - An Array of paths to Docker compose files
   * @param {String} data.project - A String of the project name (Usually this is the same as the app name)
   * @param {Object} [data.opts] - Options on what services to setop
   * @param {Array} [data.opts.services='all services'] - An Array of services to stop.
   * @returns {Promise} A Promise.
   * @example
   *
   * // Stop a specific container by id
   * return lando.engine.stop({name: 'myapp_service_1'})
   * .then(function() {
   *   lando.log.info('Container has stopped.');
   * });
   *
   * // Assume we have an `app` object called `app` already.
   *
   * // Stop all the containers for a particular app.
   * return lando.engine.stop(app);
   *
   * // Stop a certain subset of an app's services.
   * app.opts = {
   *   services: ['index', 'appserver', 'db', 'db2']
   * };
   * return lando.engine.stop(app);
   *
   */
  var stop = function(data) {

    // Verify provider is ready.
    return verifyDaemonIsReady()

    /**
     * Event that allows you to do some things before some containers are stopped.
     *
     * @since 3.0.0
     * @event pre_engine_stop
     */
    .then(function() {
      return lando.events.emit('pre-engine-stop', data);
    })

    // Stop container.
    .then(function() {
      return Promise.each(utils.normalizer(data), function(datum) {
        return Promise.retry(function() {
          if (datum.compose) {
            return cc(compose.stop(datum.compose, datum.project, datum.opts));
          }
          else if (utils.getId(datum)) {
            return docker.stop(utils.getId(datum));
          }
        });
      });
    })

    /**
     * Event that allows you to do some things after some containers are stopped.
     *
     * @since 3.0.0
     * @event post_engine_stop
     */
    .then(function() {
      return lando.events.emit('post-engine-stop', data);
    });

  };

  /**
   * Removes containers for a `compose` object or a particular container.
   *
   * There are two ways to remove containers:
   *
   *  1. Using an object with `{id: id}` where `id` is a docker recognizable id
   *  2. Using a `compose` object with `{compose: compose, project: project, opts: opts}`
   *
   * These are detailed more below.
   *
   * **NOTE:** Generally an instantiated `app` object is a valid `compose` object
   *
   * @since 3.0.0
   * @alias 'lando.engine.destroy'
   * @fires pre_engine_destroy
   * @fires post_engine_destroy
   * @param {Object} data - Remove criteria, Need eithers an ID or a service within a compose context
   * @param {String} data.id - An id that docker can recognize such as a container hash or name. Can also use `data.name` or `data.cid`.
   * @param {Array} data.compose - An Array of paths to Docker compose files
   * @param {String} data.project - A String of the project name (Usually this is the same as the app name)
   * @param {Object} [data.opts] - Options on what services to remove.
   * @param {Array} [data.opts.services='all services'] - An Array of services to remove.
   * @param {Boolean} [data.opts.volumes=true] - Also remove volumes associated with the container(s).
   * @param {Boolean} [data.opts.force=false] - Force remove the containers.
   * @param {Boolean} [data.opts.purge=false] - Implies `volumes` and `force`.
   * @returns {Promise} A Promise.
   * @example
   *
   * // Remove a specific container by id
   * return lando.engine.destroy({name: 'myapp_service_1'})
   * .then(function() {
   *   lando.log.info('Container has been destroyed.');
   * });
   *
   * // Assume we have an `app` object called `app` already.
   *
   * // Destroy all the containers for a particular app.
   * return lando.engine.destroy(app);
   *
   * // Force remove a certain subset of an app's services and their volumes
   * app.opts = {
   *   services: ['index', 'appserver', 'db', 'db2'],
   *   v: true,
   *   force: true
   * };
   * return lando.engine.destroy(app);
   *
   */
  var destroy = function(data) {

    // Verify provider is ready.
    return verifyDaemonIsReady()

    /**
     * Event that allows you to do some things before some containers are destroyed.
     *
     * @since 3.0.0
     * @event pre_engine_destroy
     */
    .then(function() {
      return lando.events.emit('pre-engine-destroy', data);
    })

    // Remove container.
    .then(function() {
      return Promise.each(utils.normalizer(data), function(datum) {
        return Promise.retry(function() {
          if (datum.compose) {
            return cc(compose.remove(datum.compose, datum.project, datum.opts));
          }
          else if (utils.getId(datum)) {
            return docker.remove(utils.getId(datum), datum.opts);
          }
        });
      });
    })

    /**
     * Event that allows you to do some things after some containers are destroyed.
     *
     * @since 3.0.0
     * @event post_engine_destroy
     */
    .then(function() {
      return lando.events.emit('post-engine-destroy', data);
    });

  };

  /**
   * Returns logs for a given `compose` object
   *
   * **NOTE:** Generally an instantiated `app` object is a valid `compose` object
   *
   * @since 3.0.0
   * @alias 'lando.engine.logs'
   * @param {Object} data - A `compose` Object or an Array of `compose` Objects if you want to get logs for more than one set of services.
   * @param {Array} data.compose - An Array of paths to Docker compose files
   * @param {String} data.project - A String of the project name (Usually this is the same as the app name)
   * @param {Object} [data.opts] - Options on how to build the `compose` objects containers.
   * @param {Boolean} [data.opts.follow=false] - Whether to follow the log. Works like `tail -f`.
   * @param {Boolean} [data.opts.timestamps=true] - Show timestamps in log.
   * @returns {Promise} A Promise.
   * @example
   *
   * // Get logs for an app
   * return lando.engine.logs(app);
   */
  var logs = function(data) {

    // Verify provider is ready.
    return verifyDaemonIsReady()

    // Get the logs.
    .then(function() {
      return Promise.each(utils.normalizer(data), function(datum) {
        return Promise.retry(function() {
          return cc(compose.logs(datum.compose, datum.project, datum.opts));
        });
      });
    });

  };

  /**
   * Tries to pull the services for a `compose` object, and then tries to build them if they are found
   * locally. This is a wrapper around `docker pull` and `docker build`.
   *
   * **NOTE:** Generally an instantiated `app` object is a valid `compose` object
   *
   * @since 3.0.0
   * @alias 'lando.engine.build'
   * @fires pre_engine_build
   * @fires post_engine_build
   * @param {Object} data - A `compose` Object or an Array of `compose` Objects if you want to build more than one set of services.
   * @param {Array} data.compose - An Array of paths to Docker compose files
   * @param {String} data.project - A String of the project name (Usually this is the same as the app name)
   * @param {Object} [data.opts] - Options on how to build the `compose` objects containers.
   * @param {Array} [data.opts.services='all services'] - The services to build.
   * @param {Boolean} [data.opts.nocache=true] - Ignore the build cache.
   * @param {Boolean} [data.opts.pull=true] - Try to pull first.
   * @returns {Promise} A Promise.
   * @example
   *
   * // Build the containers for an `app` object
   * return lando.engine.build(app);
   */
  var build = function(data) {

    // Verify provider is ready.
    return verifyDaemonIsReady()

    /**
     * Event that allows you to do some things before a `compose` Objects containers are
     * started
     *
     * @since 3.0.0
     * @event pre_engine_build
     */
    .then(function() {
      return lando.events.emit('pre-engine-build', data);
    })

    // Build image.
    .then(function() {

      // Try to pull the images first
      // THIS WILL IGNORE ANY SERVICES THAT BUILD FROM A LOCAL DOCKERFILE
      return Promise.each(utils.normalizer(data), function(datum) {
        return Promise.retry(function() {
          return cc(compose.pull(datum.compose, datum.project, datum.opts));
        });
      })

      // Then try to build
      .then(function() {
        return Promise.each(utils.normalizer(data), function(datum) {
          return Promise.retry(function() {
            return cc(compose.build(datum.compose, datum.project, datum.opts));
          });
        });
      });

    })

    /**
     * Event that allows you to do some things before a `compose` Objects containers are
     * started
     *
     * @since 3.0.0
     * @event post_engine_build
     */
    .then(function() {
      return lando.events.emit('post-engine-build', data);
    });

  };

  /**
   * Gets the docker networks.
   *
   * @since 3.0.0
   * @function
   * @alias 'lando.engine.getNetworks'
   * @see [docker api network docs](https://docs.docker.com/engine/api/v1.27/#operation/NetworkList) for info on filters option.
   * @param {Object} [opts] - Options to pass into the docker networks call
   * @param {Object} [opts.filters] - Filters options
   * @returns {Promise} A Promise with an array of network objects.
   * @example
   *
   *  // Options to filter the networks
   *  var opts = {
   *    filters: {
   *      driver: {bridge: true},
   *      name: {_default: true}
   *    }
   *  };
   *
   *  // Get the networks
   *  return lando.engine.getNetworks(opts)
   *
   *  // Filter out lando_default
   *  .filter(function(network) {
   *    return network.Name !== 'lando_default';
   *  })
   *
   *  // Map to list of network names
   *  .map(function(network) {
   *    return network.Name;
   *  });
   */
   var getNetworks = docker.getNetworks;

   /**
    * Gets a Docker network
    *
    * @since 3.0.0.
    * @function
    * @alias 'lando.engine.getNetwork'
    * @param {String} id - The id of the network
    * @returns {Object} A Dockerode Network object .
    * @example
    *
    *  // Get the network
    *  return lando.engine.getNetwork('mynetwork')
    */
    var getNetwork = docker.getNetwork;

  /**
   * Creates a Docker network
   *
   * @since 3.0.0.
   * @function
   * @alias 'lando.engine.createNetwork'
   * @see [docker api network docs](https://docs.docker.com/engine/api/v1.35/#operation/NetworkCreate) for info on opts.
   * @param {String} name - The name of the networks
   * @param {Object} [opts] - See API network docs above
   * @returns {Promise} A Promise with inspect data.
   * @example
   *
   *  // Create the network
   *  return ando.engine.createNetwork('mynetwork')
   */
   var createNetwork = docker.createNetwork;

  // Return
  return {
    up: up,
    isInstalled: isInstalled,
    isUp: isUp,
    down: down,
    isRunning: isRunning,
    list: list,
    exists: exists,
    scan: scan,
    start: start,
    run: run,
    stop: stop,
    destroy: destroy,
    logs: logs,
    build: build,
    getNetwork: getNetwork,
    getNetworks: getNetworks,
    createNetwork: createNetwork
  };

};
