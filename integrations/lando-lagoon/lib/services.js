'use strict';

// Modules
const _ = require('lodash');

// Services that support SSL
const sslServices = ['nginx', 'nginx-drupal'];

// SQL services
const SQLServices = ['lagoon-mariadb', 'lagoon-postgres'];

/*
 * Helper to map lagoon type data to a lando service
 */
const getLandoServiceType = type => {
  switch (type) {
    case 'nginx': return 'lagoon-nginx';
    case 'nginx-drupal': return 'lagoon-nginx';
    case 'none': return 'lagoon-none';
    case 'mariadb': return 'lagoon-mariadb';
    case 'mariadb-drupal': return 'lagoon-mariadb';
    case 'php-cli': return 'lagoon-php-cli';
    case 'php-cli-drupal': return 'lagoon-php-cli';
    case 'php-fpm': return 'lagoon-php';
    case 'redis': return 'lagoon-redis';
    case 'solr': return 'lagoon-solr';
    case 'solr-drupal': return 'lagoon-solr';
    case 'postgres': return 'lagoon-postgres';
    case 'postgres-drupal': return 'lagoon-postgres';
    case 'varnish': return 'lagoon-varnish';
    case 'varnish-drupal': return 'lagoon-varnish';
    default: return false;
  };
};

/*
 * Helper to map lagoon type data to a flavor eg drupal
 */
const getFlavor = type => {
  switch (type) {
    case 'nginx-drupal': return 'drupal';
    case 'mariadb-drupal': return 'drupal';
    case 'php-cli-drupal': return 'drupal';
    case 'solr-drupal': return 'drupal';
    case 'postgres-drupal': return 'drupal';
    default: return 'lagoon';
  };
};

/*
 * Helper to map into a lando service
 */
const getLandoService = lagoon => {
  // Start with the defaults
  const lando = {
    name: lagoon.name,
    image: lagoon.type,
    flavor: getFlavor(lagoon.type),
    type: getLandoServiceType(lagoon.type),
    ssl: _.includes(sslServices, lagoon.type),
    sslExpose: false,
    lagoon: lagoon.compose,
    config: _.get(lagoon, 'config.config', {}),
  };

  // If this is a php-cli service then add in the build steps
  if (lando.type === 'lagoon-php-cli') {
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
exports.getLandoAuxServices = (services = {}, config) => {
  // If we can add mailhog, lets add it
  if (!_.isEmpty(getServicesByType(services, 'lagoon-php'))) {
    services.mailhog = {type: 'mailhog:v1.0.0', hogfrom: getServicesByType(services, 'lagoon-php')};
  }
  // Add in lagoon CLI
  // @TODO: do we want a legit lagoon service for this or is compose sufficient?
  services.lagooncli = {
    type: 'compose',
    services: {
      image: 'amazeeio/lagoon-cli',
      command: 'tail -f /dev/null',
      volumes: [
        `${config.home}:/root`,
      ],
    },
  };

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

/*
 * Returns SQL services
 */
exports.getSQLServices = (services = []) => _(services)
  .filter(service => _.includes(SQLServices, service.type))
  .value();

