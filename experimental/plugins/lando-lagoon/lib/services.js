'use strict';

// Modules
const _ = require('lodash');

/*
 * Helper to map lagoon type data to a lando service
 */
const getLandoServiceType = type => {
  switch (type) {
    case 'nginx-drupal': return 'lagoon-nginx';
    case 'mariadb-drupal': return 'lagoon-mariadb';
    case 'php-cli-drupal': return 'lagoon-php-cli';
    case 'php-fpm': return 'lagoon-php';
    default: return false;
  };
};

/*
 * Helper to map into a lando service
 */
const getLandoService = lagoon => ({
  name: lagoon.name,
  type: getLandoServiceType(lagoon.type),
  lagoon: lagoon.config,
});


/*
 * Helper to get a lagoon envvar with a fallback based on flavor
 */
/*
const getLagoonEnv = (service, key, fallback) => {
  return _.get(service, `lagoon.environment.${key}`, fallback);
};
*/

/*
 * Maps parsed lagoon config into related Lando things
 */
exports.getLandoServices = (services = []) => _(services)
  // Filter out services that are not supported yet
  .filter(service => getLandoServiceType(service.type) !== false)
  // Merge in other needed lando things
  .map(service => _.merge({}, getLandoService(service)))
  // Finally map to an object
  .map(service => ([service.name, service]))
  .fromPairs()
  .value();
