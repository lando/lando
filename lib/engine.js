/**
 * Contains methods and events related to running docker things.
 *
 * @since 3.0.0
 * @fires pre-bootstrap
 * @module engine
 * @example
 *
 * // Start the docker engine
 * return lando.engine.up();
 *
 * // List all lando containers
 * return lando.engine.list(data);
 *
 * // Run a command(s) on a container(s)
 * return lando.engine.run(data);
 *
 * // Inspect the details of a container
 * return lando.engine.inspect(data);
 *
 * // Destroys a container(s)
 * return lando.engine.destroy(data);
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
 * Tries to activate the docker engine/daemon.
 *
 * Generally the engine will be up and active, but if it isn't for whatever reason
 * Lando will try to start it.
 *
 * NOTE: Most commands that require the docker engine to be up will automatically
 * call this anyway.
 *
 * @todo Does this need to be publically exposed still?
 * @since 3.0.0
 * @fires pre-engine-up
 * @fires post-engine-up
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
exports.up = function() {

  // Verify the provider is already installed.
  return verifyDaemonInstalled()

  /**
   * Event that allows you to do some things before the docker engine is booted
   * up.
   *
   * @since 3.0.0
   * @event module:engine.event:pre-engine-up
   */
  .then(function() {
    return lando.events.emit('pre-engine-up');
  })

  // Bring the provider up.
  .then(function() {
    return daemon.up();
  })

  /**
   * Event that allows you to do some things after the docker engine is booted
   * up.
   *
   * @since 3.0.0
   * @event module:engine.event:post-engine-up
   */
  .then(function() {
    return lando.events.emit('post-engine-up');
  });

};

/**
 * Determines whether the docker engine is up or not.
 *
 * @todo Does this need to be publically exposed still?
 * @since 3.0.0
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
exports.isUp = function() {
  return daemon.isUp();
};

/**
 * Tries to deactivate the docker engine/daemon.
 *
 * NOTE: Most commands that require the docker engine to be up will automatically
 * call this anyway.
 *
 * @todo Does this need to be publically exposed still?
 * @since 3.0.0
 * @fires pre-engine-down
 * @fires post-engine-down
 * @returns {Promise} A Promise.
 */
exports.down = function() {

  // Verify the provider is already installed.
  return verifyDaemonInstalled()

  /**
   * Event that allows you to do some things after the docker engine is booted
   * up.
   *
   * @since 3.0.0
   * @event module:engine.event:pre-engine-down
   */
  .then(function() {
    return lando.events.emit('pre-engine-down');
  })

  // Bring the provider down.
  .then(function() {
    return daemon.down({maxRetries: 3});
  })

  /**
   * Event that allows you to do some things after the docker engine is booted
   * up.
   *
   * @since 3.0.0
   * @event module:engine.event:post-engine-down
   */
  .then(function() {
    return lando.events.emit('post-engine-down');
  });

};

/**
 * Determines whether a container is running or not
 *
 * @since 3.0.0
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
exports.isRunning = function(data) {

  return verifyDaemonIsReady()
  .then(function() {
    return docker.isRunning(data);
  });

};

/**
 * Lists all the Lando containers. Optionally filter by app name.
 *
 * @since 3.0.0
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
exports.list = function(data) {

  // Verify provider is ready.
  return verifyDaemonIsReady()

  // Get list of containers from engine.
  .then(function() {
    return docker.list(data);
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
exports.exists = function(data) {

  // Verify provider is ready.
  return verifyDaemonIsReady()

  // Exists
  .then(function() {
    return docker.exists(data);
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
 * @param {Object} data - Search criteria, Need eithers an ID or a service within a compose context
 * @param {String} data.id - An id that docker can recognize such as a conatainer hash or name. Can also use `data.name` or `data.cid`.
 * @param {Array} data.compose - An Array of paths to Docker compose files
 * @param {String} data.project - A String of the project name (Usually this is the same as the app name)
 * @param {Object} data.opts - Options on what service to inspect
 * @param {Array} data.opts.services - An Array of services to inspect.
 * @returns {Promise} A Promise with an Object of service metadata.
 * @example
 *
 * // Log inspect data using an id
 * return lando.engine.inspect({id: '146d321f212d'})
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
 * // Inspect the service
 * return lando.engine.inspect(compose);
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
 * Starts the containers/services for the specified `compose` object.
 *
 * **NOTE:** Generally an instantiated `app` object is a valid `compose` object
 *
 * @since 3.0.0
 * @fires pre-engine-start
 * @fires post-engine-start
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
exports.start = function(data) {

  // Verify provider is ready.
  return verifyDaemonIsReady()

  /**
   * Event that allows you to do some things before a `compose` Objects containers are
   * started
   *
   * @since 3.0.0
   * @event module:engine.event:pre-engine-start
   */
  .then(function() {
    return lando.events.emit('pre-engine-start', data);
  })

  // Start container.
  .then(function() {
    return docker.start(data);
  })

  /**
   * Event that allows you to do some things after a `compose` Objects containers are
   * started
   *
   * @since 3.0.0
   * @event module:engine.event:post-engine-start
   */
  .then(function() {
    return lando.events.emit('post-engine-start', data);
  });

};

/**
 * Runs a command on a given service/container. This is a wrapper around `docker exec`.
 *
 * @since 3.0.0
 * @fires pre-engine-run
 * @fires post-engine-run
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
exports.run = function(data) {

  // Make sure the provider is ready
  return verifyDaemonIsReady()

  /**
   * Event that allows you to do some things before a command is run on a particular
   * container.
   *
   * @since 3.0.0
   * @event module:engine.event:pre-engine-run
   */
  .then(function() {
    return lando.events.emit('pre-engine-run', data);
  })

  // Run.
  .then(function() {
    return docker.run(data);
  })

  /**
   * Event that allows you to do some things after a command is run on a particular
   * container.
   *
   * @since 3.0.0
   * @event module:engine.event:post-engine-run
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
 * @fires pre-engine-stop
 * @fires post-engine-stop
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
exports.stop = function(data) {

  // Verify provider is ready.
  return verifyDaemonIsReady()

  /**
   * Event that allows you to do some things before some containers are stopped.
   *
   * @since 3.0.0
   * @event module:engine.event:pre-engine-stop
   */
  .then(function() {
    return lando.events.emit('pre-engine-stop', data);
  })

  // Stop container.
  .then(function() {
    return docker.stop(data);
  })

  /**
   * Event that allows you to do some things after some containers are stopped.
   *
   * @since 3.0.0
   * @event module:engine.event:post-engine-stop
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
 * @fires pre-engine-destroy
 * @fires post-engine-destroy
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
exports.destroy = function(data) {

  // Verify provider is ready.
  return verifyDaemonIsReady()

  /**
   * Event that allows you to do some things before some containers are destroyed.
   *
   * @since 3.0.0
   * @event module:engine.event:pre-engine-destroy
   */
  .then(function() {
    return lando.events.emit('pre-engine-destroy', data);
  })

  // Remove container.
  .then(function() {
    return docker.remove(data);
  })

  /**
   * Event that allows you to do some things after some containers are destroyed.
   *
   * @since 3.0.0
   * @event module:engine.event:post-engine-destroy
   */
  .then(function() {
    return lando.events.emit('post-engine-destroy', data);
  });

};

/**
 * Tries to pull the services for a `compose` object, and then tries to build them if they are found
 * locally. This is a wrapper around `docker pull` and `docker build`.
 *
 * **NOTE:** Generally an instantiated `app` object is a valid `compose` object
 *
 * @since 3.0.0
 * @fires pre-engine-build
 * @fires post-engine-build
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
exports.build = function(data) {

  // Verify provider is ready.
  return verifyDaemonIsReady()

  /**
   * Event that allows you to do some things before a `compose` Objects containers are
   * started
   *
   * @since 3.0.0
   * @event module:engine.event:pre-engine-build
   */
  .then(function() {
    return lando.events.emit('pre-engine-build', data);
  })

  // Build image.
  .then(function() {
    return docker.build(data);
  })

  /**
   * Event that allows you to do some things before a `compose` Objects containers are
   * started
   *
   * @since 3.0.0
   * @event module:engine.event:post-engine-build
   */
  .then(function() {
    return lando.events.emit('post-engine-build', data);
  });

};
