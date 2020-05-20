'use strict';

// Modules
const _ = require('lodash');
const utils = require('./../../lib/utils');

/*
 * Helper to map lagoon type data to a lando service
 */
const getLandoService = type => {
  switch (type) {
    case 'php': return 'platformsh-php';
    case 'mariadb': return 'platformsh-mariadb';
    case 'mysql': return 'platformsh-mariadb';
    default: return false;
  };
};

/*
 * Helper to map lagoon type data to a lando service
 */
const getLandoBuildStep = (flavor = 'none') => {
  switch (flavor) {
    case 'none': return [];
    case 'composer': return [
      'composer --no-interaction install --no-progress --prefer-dist --optimize-autoloader',
    ];
    case 'default': return ['npm prune --userconfig .npmrc && npm install --userconfig .npmrc '];
    case 'drupal': return ['drush make'];
    default: return [];
  };
};

/*
 * Helper to return a type and version from platform data
 */
const getServiceType = ({name = 'appserver', type} = {}) => ({
  name,
  type: _.first(type.split(':')),
  version: _.last(type.split(':')),
});

/*
 * Build Platformsh
 */
module.exports = {
  name: 'platformsh',
  parent: '_recipe',
  config: {
    confSrc: __dirname,
    proxy: {},
    services: {},
    tooling: {},
  },
  builder: (parent, config) => class LandoPlatformsh extends parent {
    constructor(id, options = {}) {
      // Get our options
      options = _.merge({}, config, options);
      // Get the platformConfig weve loaded and parsed
      const platformConfig = _.get(options, '_app.platformsh', {});

      // Loop through and build our appservers
      _.forEach(platformConfig.applications, application => {
        // Get info about the appserver
        const {name, type, version} = getServiceType(application.configuration);
        // Add it as a lando service if its supported
        if (getLandoService(type) !== false) {
          options.services[name] = _.merge({}, utils.getServiceDefaults(), {
            appserver: true,
            id: options.id,
            type: getLandoService(type),
            build_as_root_internal: ['/helpers/recreate-users.sh'],
            build_internal: getLandoBuildStep(_.get(application, 'configuration.build.flavor')),
            platformsh: application.configuration,
            runConfig: _.find(platformConfig.runConfig, {service: name}),
            version,
          });
        }
      });

      // Add in additional services
      _.forEach(platformConfig.services, (service, name) => {
        // Get type about the service
        const {type, version} = getServiceType(service);
        // Add it as a lando service if its supported
        if (getLandoService(type) !== false) {
          options.services[name] = _.merge({}, utils.getServiceDefaults(), {
            appserver: false,
            id: options.id,
            type: getLandoService(type),
            platformsh: _.merge({}, service.configuration, {type}),
            runConfig: _.find(platformConfig.runConfig, {service: name}),
            version,
          });
        }
      });

      // Send downstream
      super(id, options);
    };
  },
};
