/**
 * This provides a way to load services
 *
 * @name services
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var merger = lando.utils.config.merge;
  var path = require('path');
  var utils = require('./lib/utils');

  // Constants
  var esd = lando.config.engineScriptsDir;
  var scd = lando.config.servicesConfigDir;
  var shd = lando.config.servicesHelpersDir;

  // Registry of services
  var registry = {};

  // The bridge network
  var landoBridgeNet = 'lando_bridge_network';

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
   * Delegator to gather info about a service for display to the user
   */
  var info = function(name, type, config) {

    // Parse the type and version
    var service = type.split(':')[0];
    var version = type.split(':')[1] || 'latest';

    // Check to verify whether the service exists in the registry
    if (!registry[service]) {
      lando.log.warn('%s is not a supported service.', service);
      return {};
    }

    // Start an info collector
    var info = {};

    // Add basic info about our service
    info.type = service;
    info.version = version;
    info.hostnames = [name];
    info.hostnames.push([name, config._dockerName, 'internal'].join('.'));

    // Get additional information
    info = merger(info, registry[service].info(name, config));

    // Log
    lando.log.verbose('Info get for %s:%s named %s', service, version, name);

    // Return info
    return info;

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

    // If this version is not supported throw a warning and return
    if (!_.includes(registry[service].versions, config.version)) {
      lando.log.warn('%s version %s not supported.', service, config.version);
      return {};
    }

    // Move our config into the userconfroot if we have some
    // NOTE: we need to do this because on macOS and Windows not all host files
    // are shared into the docker vm
    if (_.has(registry[service], 'configDir')) {
      var to = path.join(scd, service);
      lando.utils.engine.moveConfig(registry[service].configDir, to);
    }

    // Get the networks, services and volumes
    var networks = registry[service].networks(name, config);
    var services = registry[service].services(name, config);
    var volumes = registry[service].volumes(name, config);

    // Add in the our global docker entrypoint
    // NOTE: this can be overridden down the stream
    var entrypoint = path.join(esd, 'lando-entrypoint.sh');
    services[name] = merger(services[name], utils.setEntrypoint(entrypoint));
    lando.log.debug('Setting default entrypoint %s for %s', entrypoint, name);

    // Add in some helpful ENVs
    services[name].environment = merger(services[name].environment, {
      LANDO_SERVICE_NAME: name,
      LANDO_SERVICE_TYPE: service,
      LANDO_MOUNT: config._mount
    });

    // Add in some helpful volumes
    var shareMode = (process.platform === 'darwin') ? ':delegated' : '';
    services[name] = merger(services[name], {volumes: [
      '$LANDO_APP_ROOT_BIND:/app' + shareMode,
      '$LANDO_ENGINE_HOME:/user' + shareMode,
      '$LANDO_ENGINE_CONF:/lando' + shareMode,
      '$LANDO_ENGINE_SCRIPTS_DIR/user-perms.sh:/user-perms.sh'
    ]});

    // Data about some common helpers
    var scripts = [
      {script: 'load-keys.sh', local: esd, remote: 'scripts'},
      {script: 'mysql-import.sh', local: shd, remote: 'helpers'},
      {script: 'mysql-export.sh', local: shd, remote: 'helpers'},
    ];

    // Add in helpers and scripts
    _.forEach(scripts, function(script) {
      var f = script.script;
      var local = script.local;
      var remote = script.remote;
      var vols = services[name].volumes;
      services[name].volumes = utils.addScript(f, vols, local, remote);
    });

    // Add in any custom pre-runscripts
    if (!_.isEmpty(config.scripts)) {
      _.forEach(config.scripts, function(script) {
        var r = path.join('/scripts', path.basename(script));
        var mount = utils.buildVolume(script, r, '$LANDO_APP_ROOT_BIND');
        services[name].volumes = utils.addConfig(mount, services[name].volumes);
      });
    }

    // Process any compose overrides we might have
    if (_.has(config, 'overrides')) {

      // Log
      lando.log.debug('Overriding %s with', name, config.overrides);

      // Merge
      services[name] = merger(services[name], config.overrides.services);
      volumes = merger(volumes, config.overrides.volumes);
      networks = merger(networks, config.overrides.networks);

      // If we need to provide overrides for other things, eg behind the scenes
      // cli services let's do that here
      if (_.has(config, '_hiddenServices')) {
        _.forEach(config._hiddenServices, function(o) {
          services[o] = merger(services[o], config.overrides.services);
        });
      }

    }

    // Add in default network stuff
    networks = merger(networks, utils.connectBridge(landoBridgeNet));

    // Go through all the services and add in the lando bridgenet
    _.forEach(services, function(service, name) {
      var data = {app: config._dockerName, name: name};
      service.networks = merger(utils.connectNet(data), service.networks);
    });

    // Return the built compose file
    return {
      networks: networks,
      services: services,
      volumes: volumes
    };

  };

  return {
    add: add,
    build: build,
    get: get,
    info: info,
    bridge: landoBridgeNet
  };

};
