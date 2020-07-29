'use strict';

// Modules
const _ = require('lodash');

/*
 * Helper to map lagoon type data to a lando service
 */
const getLandoServiceType = type => {
  switch (type) {
    case 'elasticsearch': return 'platformsh-elasticsearch';
    case 'influxdb': return 'platformsh-influxdb';
    case 'kafka': return 'platformsh-kafka';
    case 'varnish': return 'platformsh-varnish';
    case 'chrome-headless': return 'platformsh-chrome-headless';
    case 'mariadb': return 'platformsh-mariadb';
    case 'memcached': return 'platformsh-memcached';
    case 'mongodb': return 'platformsh-mongodb';
    case 'mysql': return 'platformsh-mariadb';
    case 'php': return 'platformsh-php';
    case 'postgresql': return 'platformsh-postgresql';
    case 'rabbitmq': return 'platformsh-rabbitmq';
    case 'redis': return 'platformsh-redis';
    case 'redis-persistent': return 'platformsh-redis';
    case 'solr': return 'platformsh-solr';
    default: return false;
  }
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
    // We need to reeload our keys because in some situations they cannot be
    // set until now
    lando.build_as_root_internal.push('/helpers/load-keys.sh --silent');
    // Add in the build wrapper
    // @NOTE: php applications need to run build steps after the OPEN step to
    // ensure any needed php extensions are installed. all other services should
    // run before since they may be needed to start up the app correctly
    if (lando.type === 'platformsh-php') {
      lando.run_internal = ['/helpers/psh-build.sh'];
    } else {
      lando.build_internal = ['/helpers/psh-build.sh'];
    }
    // Generate certs for proxy purposes but dont expose things
    lando.ssl = true;
    lando.sslExpose = false;
    lando.proxyPort = 80;
  }

  // Set the varnish port if applicable
  if (lando.type === 'platformsh-varnish') lando.proxyPort = 8080;

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
