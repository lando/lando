'use strict';

// Modules
const _ = require('lodash');

/*
 * Helper to map lagoon type data to a lando service
 */
const getLandoServiceType = type => {
  switch (type) {
    case 'nginx-drupal': return 'lagoon-nginx-drupal';
    case 'mariadb-drupal': return 'lagoon-mariadb-drupal';
    case 'php-cli-drupal': return 'lagoon-php-cli-drupal';
    case 'php-fpm': return 'lagoon-php';
    default: return false;
  };
};

/*
 * Helper to map into a lando service
 */
const getLandoService = lagoon => {
  // Start with the defaults
  const lando = {
    name: lagoon.name,
    type: getLandoServiceType(lagoon.type),
    lagoon: lagoon.compose,
    config: _.get(lagoon, 'config.config', {}),
  };

  // If this is a php-cli-drupal service then add in the build steps
  if (lando.type === 'lagoon-php-cli-drupal') {
    lando.build_internal = _.get(lagoon, 'config.config.build', []);
  }

  // Return
  return lando;
};

/*
 * Helper to get service names by type
 */
const getServicesByType = (services, type) => _(services)
  .filter(service => service.type === type)
  .map('name')
  .value();

/*
 * Helper to get a lagoon envvar with a fallback based on flavor
 */
exports.getLagoonEnv = (service, key, fallback = 'lagoon') => {
  return _.get(service, `lagoon.environment.${key}`, fallback);
};

/*
 * Determines if we need to add extra services
 */
exports.getLandoAuxServices = (services = {}) => {
  // If we can add mailhog, lets add it
  if (!_.isEmpty(getServicesByType(services, 'lagoon-php'))) {
    services.mailhog = {type: 'mailhog:v1.0.0', hogfrom: getServicesByType(services, 'lagoon-php')};
  }

  // Return it all
  return services;
};

/*
 * Maps parsed lagoon config into related Lando things
 */
exports.getLandoServices = (services = []) => _(services)
  // Filter out services that are not supported yet
  .filter(service => getLandoServiceType(service.type) !== false)
  // Merge in other needed lando things
  .map(service => _.merge({}, getLandoService(service)))
  // Finally map to an object
  .map(service => ([service.name, service])).fromPairs()
  .value();
