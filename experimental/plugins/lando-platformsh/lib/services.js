'use strict';

// Modules
const _ = require('lodash');

/*
 * Helper to map lagoon type data to a lando service
 */
const getLandoServiceType = type => {
  switch (type) {
    case 'php': return 'platformsh-php';
    case 'mariadb': return 'platformsh-mariadb';
    case 'mysql': return 'platformsh-mariadb';
    default: return false;
  };
};

/*
 * Helper to return a type and version from platform data
 */
const getPlatformServiceType = ({name = 'app', type} = {}) => ({
  name,
  type: _.first(type.split(':')),
  version: _.last(type.split(':')),
});

/*
 * Helper to map into a lando service
 */
const getLandoService = platform => {
  // Start with defaults
  const lando = {
    name: platform.name,
    type: getLandoServiceType(platform.type),
    version: platform.version,
    platformsh: platform,
  };

  // If this is an application then we need some more juice
  if (platform.application) {
    // Add some magic to reset the web/app user
    lando.build_as_root_internal = ['/helpers/psh-recreate-users.sh'];
    // Add in the build wrapper
    lando.build_internal = ['/helpers/psh-build.sh'];
    // Generate certs for proxy purposes but dont expose things
    lando.ssl = true;
    lando.sslExpose = false;
  }

  // Return
  return lando;
};

/*
 * Maps parsed platform config into related Lando things
 */
exports.getLandoServices = (services = [], runConfig = []) => _(services)
  // Break apart platform type into typ and version
  .map(service => _.merge({}, service, getPlatformServiceType(service)))
  // Filter out services that are not supported yet
  .filter(service => getLandoServiceType(service.type) !== false)
  // Merge in other needed lando things
  .map(service => _.merge({}, getLandoService(service), {runConfig: _.find(runConfig, {service: service.name})}))
  // Finally map to an object
  .map(service => ([service.name, service]))
  .fromPairs()
  .value();
