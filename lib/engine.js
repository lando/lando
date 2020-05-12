'use strict';

// Modules
const _ = require('lodash');
const LandoDaemon = require('./daemon');
const Landerode = require('./docker');
const router = require('./router');

/*
 * @TODO
 */
module.exports = class Engine {
  // @TODO: We need to figure out compose a bit better here, there is no default option right now, see similar comments in ./lando.js
  constructor(daemon = new LandoDaemon(), docker = new Landerode(), compose = () => {}, config = {}) {
    this.docker = docker;
    this.daemon = daemon;
    this.compose = compose;
    this.engineCmd = (name, data, run = () => router[name](data, this.compose, this.docker)) => router.eventWrapper(
      name,
      daemon,
      daemon.events,
      data,
      run
    );
    // Determine install status
    this.composeInstalled = config.composeBin !== false;
    this.dockerInstalled = this.daemon.docker !== false;
    // Grab the supported ranges for our things
    this.supportedVersions = config.dockerSupportedVersions;
  };

  /**
   * Event that allows you to do some things before a `compose` object's containers are
   * built
   *
   * @since 3.0.0
   * @alias lando.events:pre-engine-build
   * @event pre_engine_build
   */
  /**
   * Event that allows you to do some things after a `compose` object's containers are
   * built
   *
   * @since 3.0.0
   * @alias lando.events:post-engine-build
   * @event post_engine_build
   */
  /**
   * Tries to pull the services for a `compose` object, and then tries to build them if they are found
   * locally. This is a wrapper around `docker pull` and `docker build`.
   *
   * **NOTE:** Generally an instantiated `App` instance is a valid `compose` object
   *
   * @since 3.0.0
   * @alias lando.engine.build
   * @fires pre_engine_build
   * @fires post_engine_build
   * @param {Object} data A `compose` Object or an Array of `compose` Objects if you want to build more than one set of services.
   * @param {Array} data.compose An Array of paths to Docker compose files
   * @param {String} data.project A String of the project name (Usually this is the same as the app name)
   * @param {Object} [data.opts] Options on how to build the `compose` objects containers.
   * @param {Array} [data.opts.services='all services'] The services to build.
   * @param {Boolean} [data.opts.nocache=true] Ignore the build cache.
   * @param {Boolean} [data.opts.pull=true] Try to pull first.
   * @return {Promise} A Promise.
   * @example
   * return lando.engine.build(app);
   */
  build(data) {
    return this.engineCmd('build', data, data => router.build(data, this.compose));
  };

  /**
   * Creates a Docker network
   *
   * @since 3.0.0.
   * @function
   * @alias lando.engine.createNetwork
   * @see [docker api network docs](https://docs.docker.com/engine/api/v1.35/#operation/NetworkCreate) for info on opts.
   * @param {String} name The name of the networks
   * @return {Promise} A Promise with inspect data.
   * @example
   * return lando.engine.createNetwork('mynetwork')
   */
  createNetwork(name) {
    return this.docker.createNet(name);
  };

  /**
   * Event that allows you to do some things before some containers are destroyed.
   *
   * @since 3.0.0
   * @alias lando.events:pre-engine-destroy
   * @event pre_engine_destroy
   */
  /**
   * Event that allows you to do some things after some containers are destroyed.
   *
   * @since 3.0.0
   * @alias lando.events:post-engine-destroy
   * @event post_engine_destroy
   */
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
   * **NOTE:** Generally an instantiated `App` instance is a valid `compose` object
   *
   * @since 3.0.0
   * @alias lando.engine.destroy
   * @fires pre_engine_destroy
   * @fires post_engine_destroy
   * @param {Object} data Remove criteria, Need eithers an ID or a service within a compose context
   * @param {String} data.id An id that docker can recognize such as a container hash or name. Can also use `data.name` or `data.cid`.
   * @param {Array} data.compose An Array of paths to Docker compose files
   * @param {String} data.project A String of the project name (Usually this is the same as the app name)
   * @param {Object} [data.opts] Options on what services to remove.
   * @param {Array} [data.opts.services='all services'] An Array of services to remove.
   * @param {Boolean} [data.opts.volumes=true] Also remove volumes associated with the container(s).
   * @param {Boolean} [data.opts.force=false] Force remove the containers.
   * @param {Boolean} [data.opts.purge=false] Implies `volumes` and `force`.
   * @return {Promise} A Promise.
   * @example
   * return lando.engine.destroy(app);
   *
   */
  destroy(data) {
    return this.engineCmd('destroy', data);
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
   * **NOTE:** Generally an instantiated `app` instance is a valid `compose` object
   *
   * @since 3.0.0
   * @alias lando.engine.exists
   * @param {Object} data Search criteria, Need eithers an ID or a service within a compose context
   * @param {String} data.id An id that docker can recognize such as a conatainer hash or name. Can also use `data.name` or `data.cid`.
   * @param {Array} data.compose An Array of paths to Docker compose files
   * @param {String} data.project A String of the project name (Usually this is the same as the app name)
   * @param {Object} data.opts Options on what service to check
   * @param {Array} data.opts.services An Array of services to check
   * @return {Promise} A Promise with a Boolean of whether the service exists or not.
   * @example
   * return lando.engine.exists(compose);
   */
  exists(data) {
    return this.engineCmd('exists', data);
  };

  /*
   * @TODO: Need to docblock this correctly so it shows up in the API docs
   */
  getCompatibility(supportedVersions = this.supportedVersions) {
    const semver = require('semver');
    return this.daemon.getVersions().then(versions => {
      // Remove the things we dont need depending on platform
      // @TODO: Should daemon.getVersions just do this automatically?
      if (process.platform === 'linux') delete versions.desktop;
      else {
        delete versions.compose;
        delete versions.engine;
      }

      // We do special things with the destop version because it has a four part version string
      // We basically append part 4 on part 3 and THINK this should approximate semver close enough
      const clean = version => {
        const parts = version.split('.');
        if (_.size(parts) === 4) {
          parts[2] = `${parts[2]}${parts.pop()}`;
          version = parts.join('.');
        }
        return semver.valid(semver.coerce(version, true));
      };

      // Docker doesnt use strict semver for the engine and compose strings so we coerce a bit
      return _(versions)
        // Do a first map pass to parse
        .map((version, thing) => ({
          name: thing,
          link: supportedVersions[thing].link[process.platform],
          wants: `${supportedVersions[thing].min} - ${supportedVersions[thing].max}`,
          version,
          semversion: clean(version),
          semmin: clean(supportedVersions[thing].min),
          semmax: clean(supportedVersions[thing].max),
        }))
        // And a second to compare
        .map(thing => _.merge({}, thing, {
          dockerVersion: true,
          satisfied: semver.satisfies(thing.semversion, `${thing.semmin} - ${thing.semmax}`, true),
        }))
        .value();
    });
  };

  /**
   * Gets a Docker network
   *
   * @since 3.0.0.
   * @function
   * @alias lando.engine.getNetwork
   * @param {String} id The id of the network
   * @return {Object} A Dockerode Network object .
   * @example
   * const network = lando.engine.getNetwork('mynetwork')
   */
  getNetwork(id) {
    return this.docker.getNetwork(id);
  };

  /**
   * Gets the docker networks.
   *
   * @since 3.0.0
   * @function
   * @alias lando.engine.getNetworks
   * @see [docker api network docs](https://docs.docker.com/engine/api/v1.27/#operation/NetworkList) for info on filters option.
   * @param {Object} [opts] Options to pass into the docker networks call
   * @param {Object} [opts.filters] Filters options
   * @return {Promise} A Promise with an array of network objects.
   */
  getNetworks(opts) {
    return this.docker.listNetworks(opts);
  };

  /**
   * Determines whether a container is running or not
   *
   * @since 3.0.0
   * @alias lando.engine.isRunning
   * @param {String} data An ID that docker can recognize such as the container id or name.
   * @return {Promise} A Promise with a boolean of whether the container is running or not
   * @example
   *
   * // Check to see if our app's web service is running
   * return lando.engine.isRunning('myapp_web_1').then(isRunning) {
   *   lando.log.info('Container %s is running: %s', 'myapp_web_1', isRunning);
   * });
   */
  isRunning(data) {
    return this.engineCmd('isRunning', data, data => this.docker.isRunning(data));
  };

  /**
   * Lists all the Lando containers. Optionally filter by app name.
   *
   * @since 3.0.0
   * @alias lando.engine.list
   * @param {Object} [options] Options to filter the list.
   * @param {Boolean} [options.all=false] Show even stopped containers
   * @param {String} [options.app] Show containers for only a certain app
   * @param {Array} [options.filter] Filter by additional key=value pairs
   * @return {Promise} A Promise with an Array of container Objects.
   * @example
   * return lando.engine.list().each(function(container) {
   *   lando.log.info(container);
   * });
   */
  list(options = {}) {
    return this.engineCmd('list', options, options => this.docker.list(options));
  };

  /**
   * Returns logs for a given `compose` object
   *
   * **NOTE:** Generally an instantiated `app` instance is a valid `compose` object
   *
   * @since 3.0.0
   * @alias lando.engine.logs
   * @param {Object} data A `compose` Object or an Array of `compose` Objects if you want to get logs for more than one set of services.
   * @param {Array} data.compose An Array of paths to Docker compose files
   * @param {String} data.project A String of the project name (Usually this is the same as the app name)
   * @param {Object} [data.opts] Options on how to build the `compose` objects containers.
   * @param {Boolean} [data.opts.follow=false] Whether to follow the log. Works like `tail -f`.
   * @param {Boolean} [data.opts.timestamps=true] Show timestamps in log.
   * @return {Promise} A Promise.
   * @example
   *
   * // Get logs for an app
   * return lando.engine.logs(app);
   */
  logs(data) {
    return this.engineCmd('logs', data, data => router.logs(data, this.compose));
  };

  /**
   * Event that allows you to do some things before a command is run on a particular
   * container.
   *
   * @since 3.0.0
   * @alias lando.events:pre-engine-run
   * @event pre_engine_run
   */
  /**
   * Event that allows you to do some things after a command is run on a particular
   * container.
   *
   * @since 3.0.0
   * @alias lando.events:post-engine-run
   * @event post_engine_run
   */
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
   * @param {Object} data A run Object or an Array of run Objects if you want to run more tha one command.
   * @param {String} data.id The container to run the command on. Must be an id that docker can recognize such as a container hash or name.
   * @param {String} data.cmd A String of a command or an Array whose elements are the parts of the command.
   * @param {Object} [data.opts] Options on how to run the command.
   * @param {String} [data.opts.mode='collect'] Either `collect` or `attach`. Attach will connect to the run `stdin`.
   * @param {String} [data.opts.pre] A String or Array of additional arguments or options to append to the `cmd` before the user specified args and options are added.
   * @param {Array} [data.opts.env=[]] Additional environmental variables to set for the cmd. Must be in the form `KEY=VALUE`.
   * @param {String} [data.opts.user='root'] The user to run the command as. Can also be `user:group` or `uid` or `uid:gid`.
   * @param {String} [data.opts.detach=false] Run the process in the background
   * @param {String} [data.opts.autoRemove=false] Automatically removes the container
   * @return {Promise} A Promise with a string containing the command's output.
   * @example
   *
   * // Run composer install on the appserver container for an app called myapp
   * return lando.engine.run({id: 'myapp_appserver_1', cmd: ['composer', 'install']});
   *
   * // Drop into an interactive bash shell on the database continer for an app called myapp
   * return lando.engine.run({
   *   id: 'myapp_database_1',
   *   cmd: ['bash'],
   *   opts: {
   *     mode: 'attach'
   *   }
   * });
   */
  run(data) {
    return this.engineCmd('run', data);
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
   * **NOTE:** Generally an instantiated `app` instance is a valid `compose` object
   *
   * @since 3.0.0
   * @alias lando.engine.scan
   * @param {Object} data Search criteria, Need eithers an ID or a service within a compose context
   * @param {String} data.id An id that docker can recognize such as a conatainer hash or name. Can also use `data.name` or `data.cid`.
   * @param {Array} data.compose An Array of paths to Docker compose files
   * @param {String} data.project A String of the project name (Usually this is the same as the app name)
   * @param {Object} data.opts Options on what service to scan
   * @param {Array} data.opts.services An Array of services to scan.
   * @return {Promise} A Promise with an Object of service metadata.
   * @example
   * // Log scan data using an id
   * return lando.engine.scan({id: '146d321f212d'}).then(function(data) {
   *   lando.log.info('Container data is %j', data);
   * });
   */
  scan(data) {
    return this.engineCmd('scan', data);
  };

  /**
   * Event that allows you to do some things before a `compose` Objects containers are
   * started
   *
   * @since 3.0.0
   * @alias lando.events:pre-engine-start
   * @event pre_engine_start
   */
  /**
   * Event that allows you to do some things after a `compose` Objects containers are
   * started
   *
   * @since 3.0.0
   * @alias lando.events:post-engine-start
   * @event post_engine_start
   */
  /**
   * Starts the containers/services for the specified `compose` object.
   *
   * **NOTE:** Generally an instantiated `app` instance is a valid `compose` object
   *
   * @since 3.0.0
   * @alias lando.engine.start
   * @fires pre_engine_start
   * @fires post_engine_start
   * @param {Object} data A `compose` Object or an Array of `compose` Objects if you want to start more than one set of services.
   * @param {Array} data.compose An Array of paths to Docker compose files
   * @param {String} data.project A String of the project name (Usually this is the same as the app name)
   * @param {Object} [data.opts] Options on how to start the `compose` Objects containers.
   * @param {Array} [data.opts.services='all services'] The services to start.
   * @param {Boolean} [data.opts.background=true] Start the services in the background.
   * @param {Boolean} [data.opts.recreate=false] Recreate the services.
   * @param {Boolean} [data.opts.removeOrphans=true] Remove orphaned containers.
   * @return {Promise} A Promise.
   * @example
   * return lando.engine.start(app);
   */
  start(data) {
    return this.engineCmd('start', data, data => router.start(data, this.compose));
  };

  /**
   * Event that allows you to do some things before some containers are stopped.
   *
   * @since 3.0.0
   * @alias lando.events:pre-engine-stop
   * @event pre_engine_stop
   */
  /**
   * Event that allows you to do some things after some containers are stopped.
   *
   * @since 3.0.0
   * @alias lando.events:post-engine-stop
   * @event post_engine_stop
   */
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
   * **NOTE:** Generally an instantiated `app` instance is a valid `compose` object
   *
   * @since 3.0.0
   * @alias lando.engine.stop
   * @fires pre_engine_stop
   * @fires post_engine_stop
   * @param {Object} data Stop criteria, Need eithers an ID or a service within a compose context
   * @param {String} data.id An id that docker can recognize such as a container hash or name. Can also use `data.name` or `data.cid`.
   * @param {Array} data.compose An Array of paths to Docker compose files
   * @param {String} data.project A String of the project name (Usually this is the same as the app name)
   * @param {Object} [data.opts] Options on what services to setop
   * @param {Array} [data.opts.services='all services'] An Array of services to stop.
   * @return {Promise} A Promise.
   * @example
   * return lando.engine.stop(app);
   */
  stop(data) {
    return this.engineCmd('stop', data);
  };
};

