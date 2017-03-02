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
    var newDir = path.join(ucr, 'services', 'config', service);
    fs.mkdirpSync(newDir);

    // Copy the old root to the new root
    // NOTE: we do not overwrite to allow user customization
    fs.copySync(dir, newDir, copyOpts);

    // Log
    lando.log.verbose('Copying %s config from %s to %s', service, dir, newDir);

    // Return the new scripts directory
    return newDir;

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
   * Helper function to inject config
   */
  var buildVolume = function(local, remote, base) {

    // Figure out the deal with local
    if (_.isString(local)) {
      local = [local];
    }

    // Transform into path if needed
    local = local.join(path.sep);

    // Normalize the path with the base if it is not absolute
    var localFile = (path.isAbsolute(local)) ? local : path.join(base, local);

    // Return the volume
    return [localFile, remote].join(':');

  };

  /**
   * Helper function to inject config
   */
  var addConfig = function(mount, volumes) {

    // Filter the volumes by the host mount
    volumes = _.filter(volumes, function(volume) {
      return volume.split(':')[1] !== mount.split(':')[1];
    });

    // Push to volumes and then return
    volumes.push(mount);

    // Return the volume
    return volumes;

  };

  /**
   * Helper function to inject scripts
   */
  var addScript = function(script, volumes) {

    // Construct the local path
    var localFile = path.join(lando.config.engineScriptsDir, script);
    var scriptFile = '/scripts/' + script;

    // Filter the volumes by the host mount
    volumes = _.filter(volumes, function(volume) {
      return volume.split(':')[1] !== scriptFile;
    });

    // Push to volume
    volumes.push([localFile, scriptFile].join(':'));

    // Return the volumes
    return volumes;

  };

  /**
   * The core service builder
   */
  var build = function(name, type, config) {

    // Parse the type
    var service = type.split(':')[0];

    // Add a version from the tag if available
    config.version = type.split(':')[1] || 'latest';

    // Check to verify whether the service exists in the registry
    if (!registry[service]) {
      lando.log.warn('%s is not a supported service.', service);
      return {};
    }

    // Log
    lando.log.verbose('Building %s %s ad %s', service, config.version, name);
    lando.log.debug('Building %s with config', name, config);

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
    lando.log.debug('Setting default entrypoint for %s', name);

    // Add in some helpful ENVs
    var env = containers[name].environment || {};
    env.LANDO_SERVICE_NAME = name;
    env.LANDO_SERVICE_TYPE = service;
    containers[name].environment = env;

    // Add in some helpful volumes
    var volumes = containers[name].volumes || [];
    volumes.push('$LANDO_APP_ROOT_BIND:/app');
    volumes.push('$LANDO_ENGINE_HOME:/user');
    containers[name].volumes = _.uniq(volumes);

    // Process any compose overrides we might have
    if (_.has(config, 'compose')) {
      lando.log.debug('Overriding %s with', name, config.compose);
      containers[name] = _.merge(containers[name], config.compose);
    }

    // Return the built services
    return containers;

  };

  return {
    add: add,
    buildVolume: buildVolume,
    addConfig: addConfig,
    addScript: addScript,
    build: build,
    get: get
  };

};
