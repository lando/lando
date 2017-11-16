/**
 * This provides a way to load new init methods
 *
 * @name init
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var fs = lando.node.fs;
  var os = require('os');
  var path = require('path');

  // Fixed location of our util service compose file
  var utilDir = path.join(lando.config.userConfRoot, 'util');
  var utilFile = path.join(utilDir, 'util.yml');

  // Registry of init methods
  var registry = {};

  /*
   * Get an init method
   */
  var get = function(name) {
    if (name) {
      return registry[name];
    }
    return _.keys(registry);
  };

  /*
   * Add an init method to the registry
   */
  var add = function(name, module) {
    registry[name] = module;
  };

  /*
   * Helper to start util service
   */
  var utilService = function(name, app) {

    // Let's get a service container
    var util = {
      image: 'devwithlando/util:stable',
      environment: {
        LANDO: 'ON',
        LANDO_HOST_OS: lando.config.os.platform,
        LANDO_HOST_UID: lando.config.engineId,
        LANDO_HOST_GID: lando.config.engineGid,
        LANDO_HOST_IP: lando.config.env.LANDO_ENGINE_REMOTE_IP,
        LANDO_WEBROOT_USER: 'www-data',
        LANDO_WEBROOT_GROUP: 'www-data',
        LANDO_WEBROOT_UID: '33',
        LANDO_WEBROOT_GID: '33',
        LANDO_MOUNT: '/app',
        COLUMNS: 256,
        TERM: 'xterm'
      },
      command: ['tail', '-f', '/dev/null'],
      entrypoint: '/lando-entrypoint.sh',
      labels: {
        'io.lando.container': 'TRUE',
        'io.lando.service-container': 'TRUE'
      },
      volumes: [
        '$LANDO_ENGINE_SCRIPTS_DIR/lando-entrypoint.sh:/lando-entrypoint.sh',
        '$LANDO_ENGINE_SCRIPTS_DIR/user-perms.sh:/user-perms.sh',
        '$LANDO_ENGINE_SCRIPTS_DIR/load-keys.sh:/load-keys.sh'
      ]
    };

    // Set up our scripts
    // @todo: get volumes above into this
    var scripts = ['lando-entrypoint.sh', 'user-perms.sh', 'load-keys.sh'];
    _.forEach(scripts, function(script) {
      fs.chmodSync(path.join(lando.config.engineScriptsDir, script), '755');
    });

    // Add important ref points
    var shareMode = (process.platform === 'darwin') ? ':delegated' : '';
    util.volumes.push(app + ':/app' + shareMode);
    util.volumes.push('$LANDO_ENGINE_HOME:/user' + shareMode);

    // Build and export compose
    var service = {
      version: '3.2',
      services: {
        util: util
      }
    };

    // Log
    lando.log.debug('Run util service %j', service);
    lando.utils.compose(utilFile, service);

    // Name the project
    var project = 'landoinit' + name;

    // Try to start the util
    return {
      project: project,
      compose: [utilFile],
      container: [lando.utils.dockerComposify(project), 'util', '1'].join('_'),
      opts: {
        services: ['util']
      }
    };

  };

  /*
   * Helper to return a create key command
   */
  var createKey = function(key) {

    // Ensure that cache directory exists
    var keysDir = path.join(lando.config.userConfRoot, 'keys');
    fs.mkdirpSync(path.join(keysDir));

    // Construct a helpful and box-specific comment
    var comment = 'lando@' + os.hostname();

    // Key cmd
    return [
      'ssh-keygen',
      '-t rsa -N "" -C "' + comment + '" -f "/user/.lando/keys/' + key + '"'
    ].join(' ');
  };

  /*
   * Run a command during the init process
   */
  var run = function(name, app, cmd, user) {

    // Get the service
    var service = utilService(name, app);

    // Build out our run
    var run = {
      id: service.container,
      compose: service.compose,
      project: service.project,
      cmd: cmd,
      opts: {
        mode: 'attach',
        user: user || 'www-data',
        services: service.opts.services || ['util']
      }
    };

    // Start the container
    return lando.engine.start(service)

    // On linux lets provide a little delay to make sure our user is set up
    .then(function() {
      if (process.platform === 'linux') {
        return lando.Promise.delay(1000);
      }
    })

    // Exec
    .then(function() {
      return lando.engine.run(run);
    });

  };

  /*
   * Helper to kill any running util processes
   */
  var kill = function(name, app) {

    // Get the service
    var service = utilService(name, app);

    // Check if we have a container
    return lando.engine.exists(service)

    // Killing in the name of
    .then(function(exists) {
      if (exists) {
        return lando.engine.stop(service)
        .then(function() {
          return lando.engine.destroy(service);
        });
      }
    });

  };

  /**
   * The core init method
   */
  var build = function(name, method, options) {

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
   */
  var yaml = function(recipe, config, options) {

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
    createKey: createKey,
    get: get,
    kill: kill,
    run: run,
    yaml: yaml
  };

};
