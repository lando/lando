/**
 * This provides a way to load services
 *
 * @name services
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var fs = lando.node.fs;
  var path = require('path');

  /*
   * Helper to move conf into a mountable dir
   */
  var moveConfig = function(service, dir) {

    // Copy opts and filter out all js files
    // We dont want to give the false impression that you can edit the JS
    var copyOpts = {
      overwrite: true,
      filter: function(file) {
        return (path.extname(file) !== '.js');
      }
    };

    // Ensure userconf root exists
    var ucr = lando.config.userConfRoot;
    var newConfDir = path.join(ucr, 'services', 'config', service);
    fs.mkdirpSync(newConfDir);

    // Copy the old root to the new root
    // NOTE: we do not overwrite to allow user customization
    fs.copySync(dir, newConfDir, copyOpts);

    // Return the new scripts directory
    return newConfDir;

  };

  /*
   * Set the global docker entrypoint
   */
  var setEntrypoint = function(container) {

    // Entrypoint files
    var hostEntrypoint = '$LANDO_ENGINE_SCRIPTS_DIR/lando-entrypoint.sh';
    var contEntrypoint = '/lando-entrypoint.sh';

    // Volumes
    var volumes = container.volumes || [];
    volumes.push([hostEntrypoint, contEntrypoint].join(':'));

    // Add our things to the container
    container.entrypoint = contEntrypoint;
    container.volumes = volumes;

    // Return the container
    return container;

  };

  // Move our scripts over and set useful ENV we can use
  var scriptsDir = path.join(__dirname, '..', 'scripts');
  scriptsDir = moveConfig('scripts', scriptsDir);
  lando.config.engineScriptsDir = scriptsDir;
  lando.config.env.LANDO_ENGINE_SCRIPTS_DIR = scriptsDir;

  // Set an envvar for our config directory
  var confDir = path.join(lando.config.userConfRoot, 'services', 'config');
  lando.config.engineConfigDir = confDir;
  lando.config.env.LANDO_ENGINE_CONFIG_DIR = confDir;

  // Registry of services
  var registry = {};

  /*
   * Get all services
   */
  var get = function() {
    return _.keys(registry);
  };

  /*
   * Add a service to the registry
   */
  var add = function(name, module) {
    registry[name] = module;
  };

  /**
   * Helper to ensure config files are expanded properly
   */
  var normalizePath = function(local, remote) {

    // Normalize the path
    var isAbs = path.isAbsolute(local);
    local = (isAbs) ? local : path.join('$LANDO_APP_ROOT_BIND', local);

    // Return volume mount
    return [local, remote].join(':');

  };

  /**
   * Helper function to inject config
   */
  var addConfig = function(local, remote) {

    // Figure out the deal with local
    if (_.isString(local)) {
      local = [local];
    }

    // Transform into path
    local = local.join(path.sep);

    // Construct the local path
    var localFile = path.join(lando.config.engineConfigDir, local);

    // Return the volume
    return [localFile, remote].join(':');

  };

  /**
   * Helper function to inject scripts
   */
  var addScript = function(script) {

    // Construct the local path
    var localFile = path.join(lando.config.engineScriptsDir, script);

    // Return the volume
    return [localFile, '/scripts/' + script].join(':');

  };

  /**
   * The core service builder
   */
  var build = function(name, type, config) {

    // Parse the type
    var service = type.split(':')[0];

    // Add a version from the tag if available
    config.version = type.split(':')[1] || 'latest';

    // If this version is not supported through a warning and return
    if (!_.includes(registry[service].versions, config.version)) {
      lando.log.warn('%s version %s not supported.', service, config.version);
      return {};
    }

    // Move our config into the userconfroot if we have some
    // NOTE: we need to do this because on macOS and Windows not all host files
    // are shared into the docker vm
    if (_.has(registry[service], 'configDir')) {
      moveConfig(service, registry[service].configDir);
    }

    // Get the containers
    var containers = registry[service].builder(name, config);

    // Add in the our global docker entrypoint
    // NOTE: this can be overridden down the stream
    containers[name] = setEntrypoint(containers[name]);

    // Add in some helpful ENVs
    var env = containers[name].environment || {};
    env.LANDO_SERVICE_NAME = name;
    env.LANDO_SERVICE_TYPE = service;
    containers[name].environment = env;

    // Process any compose overrides we might have
    if (_.has(config, 'compose')) {
      containers[name] = _.merge(containers[name], config.compose);
    }

    // Return the built services
    return containers;

  };

  return {
    add: add,
    addConfig: addConfig,
    addScript: addScript,
    normalizePath: normalizePath,
    build: build,
    get: get
  };

};
