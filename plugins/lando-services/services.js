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

  /**
   * Retrieve the default version of a service.
   * Some services don't define a default, but all SHOULD.
   * @param {string} type The type of the service
   * @return {string} the version to use by default, latest if isn't defined
   * @todo Make sure all core services implement default version, then deprecate
   */
  var getDefaultVersion = function(type) {
    return _.get(registry[type], 'defaultVersion', 'latest');
  };

  /*
   * Get all services
   *
   * @since 3.0.0
   * @alias 'lando.services.get'
   */
  var get = function() {
    return _.keys(registry);
  };

  /**
   * Add a service to the registry
   *
   * @since 3.0.0
   * @alias 'lando.services.add'
   */
  var add = function(name, module) {
    registry[name] = module;
  };

  /**
   * Delegator to gather info about a service for display to the user
   *
   * @since 3.0.0
   * @alias 'lando.services.info'
   */
  var info = function(name, type, config) {

    var service = type.split(':')[0];
    var version = type.split(':')[1] || getDefaultVersion(type);

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

    // Get additional information
    info = merger(info, registry[service].info(name, config));

    // Log
    lando.log.verbose('Info get for %s:%s named %s', service, version, name);

    // Return info
    return info;

  };

  /**
   * The core service builder
   *
   * @since 3.0.0
   * @alias 'lando.services.build'
   */
  var build = function(name, type, config) {

    // Parse the type
    var service = type.split(':')[0];

    // Add a version from the tag if available
    config.version = type.split(':')[1] || getDefaultVersion(type);

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
      '$LANDO_ENGINE_CONF:/lando' + shareMode
    ]});

    // Data about some common helpers
    var scripts = [
      {script: 'user-perms.sh', local: esd, remote: 'helpers'},
      {script: 'add-cert.sh', local: esd, remote: 'scripts'},
      {script: 'load-keys.sh', local: esd, remote: 'scripts'},
      {script: 'sql-import.sh', local: shd, remote: 'helpers'},
      {script: 'sql-export.sh', local: shd, remote: 'helpers'},
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

      // Get our overrides
      var overrides = config.overrides;

      // Log
      lando.log.debug('Overriding %s with', name, config.overrides);

      // Map any build or volume keys to the correct path
      if (_.has(overrides, 'services.build')) {
        overrides.services.build = utils.normalizePath(overrides.services.build, config._root);
      }
      if (_.has(overrides, 'services.volumes')) {
        overrides.services.volumes = _.map(overrides.services.volumes, function(volume) {
          if (!_.includes(volume, ':')) {
            return volume;
          }
          else {
            var local = utils.getHostPath(volume);
            var remote = _.last(volume.split(':'));
            var excludes = _.keys(volumes).concat(_.keys(overrides.volumes));
            var host = utils.normalizePath(local, config._root, excludes);
            return [host, remote].join(':');
          }
        });
      }

      // Merge
      services[name] = merger(services[name], overrides.services);
      volumes = merger(volumes, overrides.volumes);
      networks = merger(networks, overrides.networks);

      // If we need to provide overrides for other things, eg behind the scenes
      // cli services let's do that here
      if (_.has(config, '_hiddenServices')) {
        _.forEach(config._hiddenServices, function(o) {
          services[o] = merger(services[o], overrides.services);
        });
      }

    }

    // Go through all the services and add in the lando bridgenet
    _.forEach(services, function(service, name) {
      service.networks = merger({default: {}}, service.networks);
    });

    // Return the built compose file
    return {
      networks: networks,
      services: services,
      volumes: volumes
    };

  };

  /**
   * Does a healthcheck on a service
   *
   * @since 3.0.0
   * @alias 'lando.services.healthcheck'
   */
  var healthcheck = function(container) {

    // Check to see if a service is ready
    // @NOTE: This does sane retries on a service if has a healthcheck to make
    // sure it is ready before we start e.g. mysql is ready to take connections
    return lando.Promise.retry(function() {

      // Log
      console.log('Waiting until %s service is ready...', container.service);
      lando.log.info('Waiting until %s service is ready...', container.service);

      // Docker inspect the container
      return lando.engine.scan({id: container.id})

      // Determine the health
      .then(function(data) {
        if (!_.has(data, 'State.Health')) {
          return {service: container.service, health: 'healthy'};
        }
        if (_.get(data, 'State.Health.Status', 'unhealthy') === 'healthy') {
          return {service: container.service, health: 'healthy'};
        }
        else {
          return lando.Promise.reject();
        }
      });
    }, {max: 25})

    // If healthcheck fails, catch and return data
    .catch(function(error) {
      return {service: container.service, health: 'unhealthy'};
    });

  };

  return {
    add: add,
    build: build,
    get: get,
    healthcheck: healthcheck,
    info: info
  };

};
