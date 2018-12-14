'use strict';

module.exports = lando => {
  // Modules
  const _ = lando.node._;
  const mkdirp = require('mkdirp');
  const os = require('os');
  const path = require('path');

  // Fixed location of our util service compose file
  const utilDir = path.join(lando.config.userConfRoot, 'util');

  // Registry of init methods
  const registry = {};

  /*
   * Get an init method
   *
   * @since 3.0.0
   * @alias 'lando.init.get'
   */
  const get = name => {
    if (name) {
      return registry[name];
    }
    return _.keys(registry);
  };

  /*
   * Add an init method to the registry
   *
   * @since 3.0.0
   * @alias 'lando.init.add'
   */
  const add = (name, method) => {
    registry[name] = method;
  };

  /*
   * Helper to start util service
   */
  const utilService = (name, app) => {
    // Build util file
    const filename = ['util', name, _.uniqueId()].join('-') + '.yml';
    const utilFile = path.join(utilDir, filename);

    // Let's get a service container
    const util = {
      image: 'devwithlando/util:stable',
      environment: {
        LANDO: 'ON',
        LANDO_CONFIG_DIR: '$LANDO_ENGINE_CONF',
        LANDO_HOST_OS: lando.config.os.platform,
        LANDO_HOST_UID: lando.config.engineId,
        LANDO_HOST_GID: lando.config.engineGid,
        LANDO_HOST_IP: lando.config.env.LANDO_ENGINE_REMOTE_IP,
        LANDO_SERVICE_TYPE: 'init',
        LANDO_WEBROOT_USER: 'www-data',
        LANDO_WEBROOT_GROUP: 'www-data',
        LANDO_WEBROOT_UID: '33',
        LANDO_WEBROOT_GID: '33',
        LANDO_MOUNT: '/app',
        COLUMNS: 256,
        TERM: 'xterm',
      },
      command: ['tail', '-f', '/dev/null'],
      entrypoint: '/lando-entrypoint.sh',
      labels: {
        'io.lando.container': 'TRUE',
        'io.lando.service-container': 'TRUE',
        'io.lando.id': lando.config.instance,
      },
      volumes: [
        '$LANDO_ENGINE_SCRIPTS_DIR/lando-entrypoint.sh:/lando-entrypoint.sh',
        '$LANDO_ENGINE_SCRIPTS_DIR/user-perms.sh:/helpers/user-perms.sh',
        '$LANDO_ENGINE_SCRIPTS_DIR/load-keys.sh:/load-keys.sh',
      ],
    };

    // Set up our scripts
    // @todo: get volumes above into this
    const scripts = ['lando-entrypoint.sh', 'user-perms.sh', 'load-keys.sh'];
    lando.utils.engine.makeExecutable(scripts, lando.config.engineScriptsDir);

    // Add important ref points
    const shareMode = (process.platform === 'darwin') ? ':delegated' : '';
    util.volumes.push(app + ':/app' + shareMode);
    util.volumes.push('$LANDO_ENGINE_HOME:/user' + shareMode);
    util.volumes.push('$LANDO_ENGINE_CONF:/lando' + shareMode);

    // Build and export compose
    const service = {
      version: '3.2',
      services: {
        util: util,
      },
    };

    // Log
    lando.log.debug('Run util service %j', service);
    lando.yaml.dump(utilFile, service);

    // Name the project
    const project = 'landoinit' + lando.utils.engine.dockerComposify(name);

    // Try to start the util
    return {
      project: project,
      compose: [utilFile],
      container: [project, 'util', '1'].join('_'),
      opts: {
        services: ['util'],
      },
    };
  };

  /*
   * Helper to return a performant git clone command
   *
   * This clones to /tmp and then moves to /app to avoid file sharing performance
   * hits
   *
   * @since 3.0.0
   * @alias 'lando.init.cloneRepo'
   */
  const cloneRepo = repo => {
    // Get a unique clone folder
    const tmpFolder = '/tmp/' + _.uniqueId('app-');

    // Commands
    const mkTmpFolder = 'mkdir -p ' + tmpFolder;
    const cloneRepo = 'git -C ' + tmpFolder + ' clone ' + repo + ' ./';
    const cpHome = 'cp -rfT ' + tmpFolder + ' /app';

    // Clone cmd
    return [mkTmpFolder, cloneRepo, cpHome].join(' && ');
  };

  /*
   * Helper to return a create key command
   *
   * @since 3.0.0
   * @alias 'lando.init.createKey'
   */
  const createKey = key => {
    // Ensure that cache directory exists
    const keysDir = path.join(lando.config.userConfRoot, 'keys');
    mkdirp.sync(path.join(keysDir));

    // Construct a helpful and instance-specific comment
    const comment = lando.config.instance + '.lando@' + os.hostname();
    const keyPath = '/lando/keys/' + key;

    // Key cmd
    return 'ssh-keygen -t rsa -N "" -C "' + comment + '" -f "' + keyPath + '"';
  };

  /*
   * Run a command during the init process
   *
   * @since 3.0.0
   * @alias 'lando.init.run'
   */
  const run = (name, app, cmd, user) => {
    // Get the service
    const service = utilService(name, app);

    // Build out our run
    const run = {
      id: service.container,
      compose: service.compose,
      project: service.project,
      cmd: cmd,
      opts: {
        mode: 'attach',
        user: user || 'www-data',
        services: service.opts.services || ['util'],
      },
    };

    // Log
    lando.log.verbose('Running %s on %s', run.cmd, run.id);

    // Start the container
    return lando.engine.start(service)

    // On linux lets provide a little delay to make sure our user is set up
    .then(() => {
      if (process.platform === 'linux') {
        return lando.Promise.delay(1000);
      }
    })

    // Exec
    .then(() => lando.engine.run(run));
  };

  /*
   * Helper to kill any running util processes
   *
   * @since 3.0.0
   * @alias 'lando.init.kill'
   */
  const kill = (name, app) => {
    // Get the service
    const service = utilService(name, app);
    // Check if we have a container
    return lando.engine.exists(service)
    // Killing in the name of
    .then(exists => {
      if (exists) {
        return lando.engine.stop(service).then(() => lando.engine.destroy(service));
      }
    });
  };

  /*
   * The core init method
   *
   * @since 3.0.0
   * @alias 'lando.init.build'
   */
  const build = (name, method, options) => {
    // Check to verify whether the method exists in the registry
    if (!registry[method]) {
      return {};
    }

    // Log
    lando.log.verbose('Building %s with %s method', name, method);
    lando.log.debug('Building %s with config', name, options);

    // Run the build function
    return registry[method].build(name, options);
  };

  /*
   * Helper to spit out a .lando.yml file
   *
   * @since 3.0.0
   * @alias 'lando.init.yaml'
   */
  const yaml = (recipe, config, options) => {
    // Check to verify whether the recipe exists in the registry
    if (!registry[recipe]) {
      return config;
    }

    // Log
    lando.log.verbose('Getting more config for %s app %s', recipe, config.name);
    lando.log.debug('Getting more for %s using %j', config.name, options);

    // Return the .lando.yml
    return registry[recipe].yaml(config, options);
  };

  return {
    add: add,
    build: build,
    cloneRepo: cloneRepo,
    createKey: createKey,
    get: get,
    kill: kill,
    run: run,
    yaml: yaml,
  };
};
