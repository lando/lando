/**
 * This provides a way to load new init methods
 *
 * @name init
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
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
      image: 'kalabox/util:stable',
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
      labels: {'io.lando.container': 'TRUE'},
      volumes: [
        '$LANDO_ENGINE_SCRIPTS_DIR/lando-entrypoint.sh:/lando-entrypoint.sh',
        '$LANDO_ENGINE_SCRIPTS_DIR/user-perms.sh:/scripts/user-perms.sh',
        '$LANDO_ENGINE_SCRIPTS_DIR/load-keys.sh:/scripts/load-keys.sh'
      ]
    };

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
    var project = ['lando', name, 'util'];

    // Try to start the util
    return {
      compose: [utilFile],
      project: project.join('_'),
      container: [project.join('').replace(/-/g, ''), 'util', '1'].join('_'),
      opts: {
        services: ['util']
      }
    };

  };

  /*
   * Run a command during the init process
   */
  var run = function(name, app, cmd) {

    // Get the service
    var service = utilService(name, app);

    // Build out our run
    var run = {
      id: service.container,
      cmd: cmd,
      opts: {
        mode: 'attach',
        user: 'www-data',
      }
    };

    // Start the container
    return lando.engine.start(service)

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

    // Start the container
    return lando.engine.stop(service)

    // Exec
    .then(function() {
      return lando.engine.destroy(service);
    });

  };

  /**
   * The core init method
   */
  var build = function(name, method, config) {

    // Check to verify whether the recipe exists in the registry
    if (!registry[method]) {
      lando.log.warn('%s is not a supported init method.', method);
      return {};
    }

    // Log
    lando.log.verbose('Building %s for %s', method, name);
    lando.log.debug('Building %s with config', name, config);

    // Return the init function
    return registry[method].build(name, config);

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
    get: get,
    kill: kill,
    run: run,
    yaml: yaml
  };

};
