'use strict';

module.exports = lando => {
  // Modules
  const _ = lando.node._;
  const merger = lando.utils.config.merge;
  const path = require('path');
  const utils = require('./lib/utils');

  // Constants
  const esd = lando.config.engineScriptsDir;
  const scd = lando.config.servicesConfigDir;
  const shd = lando.config.servicesHelpersDir;

  // Registry of services
  const registry = {};

  /*
   * Retrieve the default version of a service.
   * Some services don't define a default, but all SHOULD.
   * @param {string} type The type of the service
   * @return {string} the version to use by default, latest if isn't defined
   * @todo Make sure all core services implement default version, then deprecate
   */
  const getDefaultVersion = type => _.get(registry[type], 'defaultVersion', 'latest');

  /*
   * Get all services
   *
   * @since 3.0.0
   * @alias 'lando.services.get'
   */
  const get = function() {
    return _.keys(registry);
  };

  /**
   * Add a service to the registry
   *
   * @since 3.0.0
   * @alias lando.services.add
   * @param {String} name The name of the service
   * @param {Module} service The required module
   */
  const add = (name, service) => {
    registry[name] = service;
  };

  /*
   * Delegator to gather info about a service for display to the user
   *
   * @since 3.0.0
   * @alias lando.services.info
   */
  const info = (name, type, config) => {
    const service = type.split(':')[0];
    const version = type.split(':')[1] || getDefaultVersion(type);

    // Check to verify whether the service exists in the registry
    if (!registry[service]) {
      lando.log.warn('%s is not a supported service.', service);
      return {};
    }

    // Start an info collector
    let info = {};

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

  /*
   * The core service builder
   *
   * @since 3.0.0
   * @alias 'lando.services.build'
   */
  const build = (name, type, config) => {
    // Parse the type
    const service = type.split(':')[0];

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
      const to = path.join(scd, service);
      lando.utils.engine.moveConfig(registry[service].configDir, to);
    }

    // Get the networks, services and volumes
    let networks = registry[service].networks(name, config);
    let services = registry[service].services(name, config);
    let volumes = registry[service].volumes(name, config);

    // Add in some helpful ENVs
    services[name].environment = merger(services[name].environment, {
      LANDO_MOUNT: config._mount,
    });

    // Add in some helpful volumes
    const shareMode = (process.platform === 'darwin') ? ':delegated' : '';
    services[name] = merger(services[name], {volumes: [
      '$LANDO_APP_ROOT_BIND:/app' + shareMode,
      '$LANDO_ENGINE_HOME:/user' + shareMode,
    ]});

    // Data about some common helpers
    const scripts = [
      {script: 'user-perms.sh', local: esd, remote: 'helpers'},
      {script: 'add-cert.sh', local: esd, remote: 'helpers'},
      {script: 'refresh-certs.sh', local: esd, remote: 'helpers'},
      {script: 'load-keys.sh', local: esd, remote: 'scripts'},
      {script: 'sql-import.sh', local: shd, remote: 'helpers'},
      {script: 'sql-export.sh', local: shd, remote: 'helpers'},
    ];

    // Add in helpers and scripts
    _.forEach(scripts, script => {
      const f = script.script;
      const local = script.local;
      const remote = script.remote;
      const vols = services[name].volumes;
      services[name].volumes = utils.addScript(f, vols, local, remote);
    });

    // Add in any custom pre-runscripts
    if (!_.isEmpty(config.scripts)) {
      _.forEach(config.scripts, script => {
        const r = path.join('/scripts', path.basename(script));
        const mount = utils.buildVolume(script, r, '$LANDO_APP_ROOT_BIND');
        services[name].volumes = utils.addConfig(mount, services[name].volumes);
      });
    }

    // Process any compose overrides we might have
    if (_.has(config, 'overrides')) {
      // Get our overrides
      const overrides = config.overrides;

      // Log
      lando.log.debug('Overriding %s with', name, config.overrides);

      // Map any build or volume keys to the correct path
      if (_.has(overrides, 'services.build')) {
        overrides.services.build = utils.normalizePath(overrides.services.build, config._root);
      }
      if (_.has(overrides, 'services.volumes')) {
        overrides.services.volumes = _.map(overrides.services.volumes, volume => {
          if (!_.includes(volume, ':')) {
            return volume;
          } else {
            const local = utils.getHostPath(volume);
            const remote = _.last(volume.split(':'));
            const excludes = _.keys(volumes).concat(_.keys(overrides.volumes));
            const host = utils.normalizePath(local, config._root, excludes);
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
        _.forEach(config._hiddenServices, o => {
          services[o] = merger(services[o], overrides.services);
        });
      }
    }

    // Go through all the services and add in the lando bridgenet
    _.forEach(services, (service, name) => {
      service.networks = merger({default: {}}, service.networks);
    });

    // Return the built compose file
    return {
      networks: networks,
      services: services,
      volumes: volumes,
    };
  };

  /*
   * Does a healthcheck on a service
   *
   * @since 3.0.0
   * @alias lando.services.healthcheck
   */
  const healthcheck = container => {
    // Check to see if a service is ready
    // @NOTE: This does sane retries on a service if has a healthcheck to make
    // sure it is ready before we start e.g. mysql is ready to take connections
    return lando.Promise.retry(() => {
      // Log
      console.log('Waiting until %s service is ready...', container.service);
      lando.log.info('Waiting until %s service is ready...', container.service);

      // Docker inspect the container
      return lando.engine.scan({id: container.id})

      // Determine the health
      .then(data => {
        if (!_.has(data, 'State.Health')) {
          return {service: container.service, health: 'healthy'};
        }
        if (_.get(data, 'State.Health.Status', 'unhealthy') === 'healthy') {
          return {service: container.service, health: 'healthy'};
        } else {
          return lando.Promise.reject();
        }
      });
    }, {max: 25})

    // If healthcheck fails, catch and return data
    .catch(error => {
      return {service: container.service, health: 'unhealthy'};
    });
  };

  return {
    add: add,
    build: build,
    get: get,
    healthcheck: healthcheck,
    info: info,
  };
};
