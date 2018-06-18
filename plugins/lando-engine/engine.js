'use strict';

// Plugin modules
const compose = require('./lib/compose');
const daemon = require('./lib/daemon');
const Landerode = require('./lib/docker');
const utils = require('./lib/utils');

// We make this module into a function so we can pass in lando
module.exports = lando => {
  // Lando Modules
  const _ = lando.node._;
  const Promise = lando.Promise;
  const docker = new Landerode(lando.config.engineConfig, lando.Promise);

  // The path to the docker executable
  const DOCKER_EXECUTABLE = lando.config.dockerBin;
  const COMPOSE_EXECUTABLE = lando.config.composeBin;

  // Runs a docker compose command with options
  const cc = run => lando.shell.sh([COMPOSE_EXECUTABLE].concat(run.cmd), run.opts);

  /**
   * Determines whether the docker engine is installed or not
   *
   * @since 3.0.0
   * @alias lando.engine.isInstalled
   * @return {Promise} A Promise with a boolean containing the installed status.
   */
  const isInstalled = () => daemon.isInstalled(DOCKER_EXECUTABLE)
    .then(isInstalled => {
      if (!isInstalled) throw Error('Lando thinks you might need some help with your droid');
    });

  /**
   * Determines whether the docker engine is up or not.
   *
   * @todo Does this need to be publically exposed still?
   *
   * @since 3.0.0
   * @alias lando.engine.isUp
   * @return {Promise} A Promise with a boolean containing the engine up status.
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
  const isUp = () => daemon.isUp(lando, DOCKER_EXECUTABLE);

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
   * @alias lando.engine.up
   * @fires pre_engine_up
   * @fires post_engine_up
   * @return {Promise} A Promise.
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
  const up = () => isInstalled()
    /**
     * Event that allows you to do some things before the docker engine is booted
     * up.
     *
     * @since 3.0.0
     * @event pre_engine_up
     */
    .then(() => lando.events.emit('pre-engine-up'))
    .then(() => daemon.up(lando, DOCKER_EXECUTABLE))
    /**
     * Event that allows you to do some things after the docker engine is booted
     * up.
     *
     * @since 3.0.0
     * @event post_engine_up
     */
    .then(() => lando.events.emit('post-engine-up'));

  /**
   * Tries to deactivate the docker engine/daemon.
   *
   * NOTE: Most commands that require the docker engine to be up will automatically
   * call this anyway.
   *
   * @todo Does this need to be publically exposed still?
   *
   * @since 3.0.0
   * @alias lando.engine.down
   * @fires pre_engine_down
   * @fires post_engine_down
   * @return {Promise} A Promise.
   */
  const down = () => isInstalled()
    /**
     * Event that allows you to do some things after the docker engine is booted
     * up.
     *
     * @since 3.0.0
     * @event pre_engine_down
     */
    .then(() => lando.events.emit('pre-engine-down'))
    .then(() => daemon.down(lando, DOCKER_EXECUTABLE))
    /**
     * Event that allows you to do some things after the docker engine is booted
     * up.
     *
     * @since 3.0.0
     * @event post_engine_down
     */
    .then(() => lando.events.emit('post-engine-down'));

  /**
   * Determines whether the docker engine is ready or not
   *
   * @since 3.0.0
   * @alias lando.engine.isReady
   * @return {Promise} A Promise with a boolean containing the installed status.
   */
  const isReady = () => isInstalled()
    .then(() => isUp()).then(isUp => {
      if (!isUp) return up();
    });

  /**
   * Determines whether a container is running or not
   *
   * @since 3.0.0
   * @alias lando.engine.isRunning
   * @param {String} data - An ID that docker can recognize such as the container id or name.
   * @return {Promise} A Promise with a boolean of whether the container is running or not
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
  const isRunning = data => isReady().then(() => Promise.retry(() => docker.isRunning(data)));

  /**
   * Lists all the Lando containers. Optionally filter by app name.
   *
   * @since 3.0.0
   * @alias lando.engine.list
   * @param {String} [data] - An appname to filter the containers by.
   * @return {Promise} A Promise with an Array of container Objects.
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
  const list = data => isReady().then(() => Promise.retry(() => docker.list(data)));

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
   * @alias lando.engine.exists
   * @param {Object} data - Search criteria, Need eithers an ID or a service within a compose context
   * @param {String} data.id - An id that docker can recognize such as a conatainer hash or name. Can also use `data.name` or `data.cid`.
   * @param {Array} data.compose - An Array of paths to Docker compose files
   * @param {String} data.project - A String of the project name (Usually this is the same as the app name)
   * @param {Object} data.opts - Options on what service to check
   * @param {Array} data.opts.services - An Array of services to check
   * @return {Promise} A Promise with a Boolean of whether the service exists or not.
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
  const exists = data => isReady()
    // Exists
    .then(() => Promise.retry(() => {
      if (data.compose) {
        return cc(compose.getId(data.compose, data.project, data.opts)).then(id => !_.isEmpty(id));
      } else if (utils.getId(data)) {
        // Get list of containers.
        return list().then(containers => {
          // Start an ID collector
          let ids = [];
          // Add all relevant ids
          _.forEach(containers, container => {
            ids.push(container.id);
            ids.push(container.name);
          });
          // Search set of valid containers for data.
          return _.includes(ids, utils.getId(data));
        });
      }
    }));

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
   * @alias lando.engine.scan
   * @param {Object} data - Search criteria, Need eithers an ID or a service within a compose context
   * @param {String} data.id - An id that docker can recognize such as a conatainer hash or name. Can also use `data.name` or `data.cid`.
   * @param {Array} data.compose - An Array of paths to Docker compose files
   * @param {String} data.project - A String of the project name (Usually this is the same as the app name)
   * @param {Object} data.opts - Options on what service to scan
   * @param {Array} data.opts.services - An Array of services to scan.
   * @return {Promise} A Promise with an Object of service metadata.
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
  const scan = data => isReady()
    // Inspect the container.
    .then(() => Promise.retry(() => {
      if (data.compose) {
        return cc(compose.getId(data.compose, data.project, data.opts)).then(id => {
          if (!_.isEmpty(id)) {
            // @todo: this assumes that the container we want
            // is probably the first id returned. What happens if that is
            // not true or we need other ids for this service?
            const ids = id.split('\n');
            return docker.inspect(_.trim(ids.shift()));
          }
        });
      } else if (utils.getId(data)) {
        return docker.inspect(utils.getId(data));
      }
    }));

  /**
   * Starts the containers/services for the specified `compose` object.
   *
   * **NOTE:** Generally an instantiated `app` object is a valid `compose` object
   *
   * @since 3.0.0
   * @alias lando.engine.start
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
   * @return {Promise} A Promise.
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
  const start = data => isReady()
    /**
     * Event that allows you to do some things before a `compose` Objects containers are
     * started
     *
     * @since 3.0.0
     * @event pre_engine_start
     */
    .then(() => lando.events.emit('pre-engine-start', data))
    // Start
    .then(() => utils.normalizer(data)).each(d => Promise.retry(() => {
      return cc(compose.start(d.compose, d.project, d.opts));
    }))
    /**
     * Event that allows you to do some things after a `compose` Objects containers are
     * started
     *
     * @since 3.0.0
     * @event post_engine_start
     */
    .then(() => lando.events.emit('post-engine-start', data));

  /**
   * Runs a command on a given service/container. This is a wrapper around `docker exec`.
   *
   * UNTIL the resolution of https://github.com/apocas/docker-modem/issues/83 data needs to also be or be an
   * array of compose objects for this to work correctly on Windows as well. See some of the other engine
   * documentation for what a compose object looks like.
   *
   * @since 3.0.0
   * @alias lando.engine.run
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
   * @return {Promise} A Promise with a string containing the command's output.
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
  const run = data => isReady()
    /**
     * Event that allows you to do some things before a command is run on a particular
     * container.
     *
     * @since 3.0.0
     * @event pre_engine_run
     */
    .then(() => lando.events.emit('pre-engine-run', data))

    // There is weirdness starting up an exec via the Docker Remote API when
    // accessing the daemon through a named pipe on Windows. Until that is
    // resolved we currently shell the exec out to docker-compose
    //
    // See: https://github.com/apocas/docker-modem/issues/83
    //
    .then(() => Promise.each(utils.normalizer(data), ({id, cmd, compose, project, opts = {}} = {}) => {
      if (process.platform === 'win32') {
        return cc(compose.run(compose, project, _.merge({}, opts, {cmd})));
      } else {
        return docker.run(id, cmd, opts);
      }
    }))

    /**
     * Event that allows you to do some things after a command is run on a particular
     * container.
     *
     * @since 3.0.0
     * @event post_engine_run
     */
    .tap(() => lando.events.emit('post-engine-run', data))

    // Return our response
    .tap(response => response);

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
   * @alias lando.engine.stop
   * @fires pre_engine_stop
   * @fires post_engine_stop
   * @param {Object} data - Stop criteria, Need eithers an ID or a service within a compose context
   * @param {String} data.id - An id that docker can recognize such as a container hash or name. Can also use `data.name` or `data.cid`.
   * @param {Array} data.compose - An Array of paths to Docker compose files
   * @param {String} data.project - A String of the project name (Usually this is the same as the app name)
   * @param {Object} [data.opts] - Options on what services to setop
   * @param {Array} [data.opts.services='all services'] - An Array of services to stop.
   * @return {Promise} A Promise.
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
  const stop = data => isReady()
    /**
     * Event that allows you to do some things before some containers are stopped.
     *
     * @since 3.0.0
     * @event pre_engine_stop
     */
    .then(() => lando.events.emit('pre-engine-stop', data))
    // Iterate data
    .then(() => utils.normalizer(data)).each(d => Promise.retry(() => {
      return (d.compose) ? cc(compose.stop(d.compose, d.project, d.opts)) : docker.stop(utils.getId(d));
    }))
    /**
     * Event that allows you to do some things after some containers are stopped.
     *
     * @since 3.0.0
     * @event post_engine_stop
     */
    .then(() => lando.events.emit('post-engine-stop', data));

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
   * @alias lando.engine.destroy
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
   * @return {Promise} A Promise.
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
  const destroy = data => isReady()
    /**
     * Event that allows you to do some things before some containers are destroyed.
     *
     * @since 3.0.0
     * @event pre_engine_destroy
     */
    .then(() => lando.events.emit('pre-engine-destroy', data))
    // Iterate data
    .then(() => utils.normalizer(data)).each(d => Promise.retry(() => {
      return (d.compose) ? cc(compose.remove(d.compose, d.project, d.opts)) : docker.remove(utils.getId(d), d.opts);
    }))
    /**
     * Event that allows you to do some things after some containers are destroyed.
     *
     * @since 3.0.0
     * @event post_engine_destroy
     */
    .then(() => lando.events.emit('post-engine-destroy', data));

  /**
   * Returns logs for a given `compose` object
   *
   * **NOTE:** Generally an instantiated `app` object is a valid `compose` object
   *
   * @since 3.0.0
   * @alias lando.engine.logs
   * @param {Object} data - A `compose` Object or an Array of `compose` Objects if you want to get logs for more than one set of services.
   * @param {Array} data.compose - An Array of paths to Docker compose files
   * @param {String} data.project - A String of the project name (Usually this is the same as the app name)
   * @param {Object} [data.opts] - Options on how to build the `compose` objects containers.
   * @param {Boolean} [data.opts.follow=false] - Whether to follow the log. Works like `tail -f`.
   * @param {Boolean} [data.opts.timestamps=true] - Show timestamps in log.
   * @return {Promise} A Promise.
   * @example
   *
   * // Get logs for an app
   * return lando.engine.logs(app);
   */
  const logs = data => isReady()
    // Iterate data
    .then(() => utils.normalizer(data)).each(d => Promise.retry(() => cc(compose.logs(d.compose, d.project, d.opts))));

  /**
   * Tries to pull the services for a `compose` object, and then tries to build them if they are found
   * locally. This is a wrapper around `docker pull` and `docker build`.
   *
   * **NOTE:** Generally an instantiated `app` object is a valid `compose` object
   *
   * @since 3.0.0
   * @alias lando.engine.build
   * @fires pre_engine_build
   * @fires post_engine_build
   * @param {Object} data - A `compose` Object or an Array of `compose` Objects if you want to build more than one set of services.
   * @param {Array} data.compose - An Array of paths to Docker compose files
   * @param {String} data.project - A String of the project name (Usually this is the same as the app name)
   * @param {Object} [data.opts] - Options on how to build the `compose` objects containers.
   * @param {Array} [data.opts.services='all services'] - The services to build.
   * @param {Boolean} [data.opts.nocache=true] - Ignore the build cache.
   * @param {Boolean} [data.opts.pull=true] - Try to pull first.
   * @return {Promise} A Promise.
   * @example
   *
   * // Build the containers for an `app` object
   * return lando.engine.build(app);
   */
  const build = data => isReady()
    /**
     * Event that allows you to do some things before a `compose` Objects containers are
     * started
     *
     * @since 3.0.0
     * @event pre_engine_build
     */
    .then(() => lando.events.emit('pre-engine-build', data))
    // Try to pull the images first
    // THIS WILL IGNORE ANY SERVICES THAT BUILD FROM A LOCAL DOCKERFILE
    .then(() => utils.normalizer(data)).each(datum => Promise.retry(() => {
      return cc(compose.pull(datum.compose, datum.project, datum.opts));
    }))
    // Then try to build
    .then(() => utils.normalizer(data)).each(datum => Promise.retry(() => {
      return cc(compose.build(datum.compose, datum.project, datum.opts));
    }))
    /**
     * Event that allows you to do some things before a `compose` Objects containers are
     * started
     *
     * @since 3.0.0
     * @event post_engine_build
     */
    .then(() => lando.events.emit('post-engine-build', data));

  /**
   * Gets the docker networks.
   *
   * @since 3.0.0
   * @function
   * @alias lando.engine.getNetworks
   * @see [docker api network docs](https://docs.docker.com/engine/api/v1.27/#operation/NetworkList) for info on filters option.
   * @param {Object} [opts] - Options to pass into the docker networks call
   * @param {Object} [opts.filters] - Filters options
   * @return {Promise} A Promise with an array of network objects.
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
  const getNetworks = opts => docker.listNetworks(opts);

  /**
   * Gets a Docker network
   *
   * @since 3.0.0.
   * @function
   * @alias lando.engine.getNetwork
   * @param {String} id - The id of the network
   * @return {Object} A Dockerode Network object .
   * @example
   *
   *  // Get the network
   *  return lando.engine.getNetwork('mynetwork')
   */
  const getNetwork = id => docker.getNetwork(id);

  /**
   * Creates a Docker network
   *
   * @since 3.0.0.
   * @function
   * @alias lando.engine.createNetwork
   * @see [docker api network docs](https://docs.docker.com/engine/api/v1.35/#operation/NetworkCreate) for info on opts.
   * @param {String} name - The name of the networks
   * @return {Promise} A Promise with inspect data.
   * @example
   *
   *  // Create the network
   *  return ando.engine.createNetwork('mynetwork')
   */
  const createNetwork = name => docker.createNet(name);

  // Return
  return {
    up: up,
    isInstalled: isInstalled,
    isReady: isReady,
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
    createNetwork: createNetwork,
  };
};
