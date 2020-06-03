'use strict';

// Modules
const _ = require('lodash');
const {getLagoonEnv} = require('./services');

/*
 * Helper to get php related tooling commands
 */
const getMariaDBTooling = service => {
  // Get the root password
  const rootPass = getLagoonEnv(service, 'MARIADB_ROOT_PASSWORD', 'Lag00n');
  // Return the stuff
  return {
    'mysql': {
      service: ':host',
      description: 'Drops into a MySQL shell on a database service',
      cmd: `mysql -uroot -p${rootPass}`,
      user: 'root',
      options: {
        host: {
          description: 'The database service to use',
          default: service.name,
          alias: ['h'],
        },
      },
    },
    'db-import <file>': {
      service: ':host',
      description: 'Imports a dump file into a database service',
      cmd: '/helpers/sql-import.sh',
      user: 'root',
      options: {
        'host': {
          description: 'The database service to use',
          default: service.name,
          alias: ['h'],
        },
        'no-wipe': {
          description: 'Do not destroy the existing database before an import',
          boolean: true,
        },
      },
    },
    'db-export [file]': {
      service: ':host',
      description: 'Exports database from a database service to a file',
      cmd: '/helpers/sql-export.sh',
      user: 'root',
      options: {
        host: {
          description: 'The database service to use',
          default: service.name,
          alias: ['h'],
        },
        stdout: {
          description: 'Dump database to stdout',
        },
      },
    },
  };
};

/*
 * Helper to get php related tooling commands
 */
const getPhpCliDrupalTooling = service => ({
  composer: {service, cmd: '/usr/local/bin/composer --ansi'},
  drush: {service},
  node: {service},
  npm: {service},
  php: {service, cmd: '/usr/local/bin/php'},
  yarn: {service},
});

/*
 * Helper to map lagoon type data to a lando service
 */
const getServiceToolingByType = service => {
  switch (service.type) {
    case 'lagoon-mariadb-drupal': return getMariaDBTooling(service);
    case 'lagoon-php-cli-drupal': return getPhpCliDrupalTooling(service.name);
    default: return {};
  };
};

/*
 * Maps parsed platform config into related Lando things
 */
exports.getLandoTooling = services => _(services)
  .map(service => getServiceToolingByType(service))
  .filter(tools => !_.isEmpty(tools))
  .map(tools => _.map(tools, (config, name) => ([name, config])))
  .flatten()
  .fromPairs()
  .value();
