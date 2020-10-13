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
  };
};

const getPostgreSQLTooling = service => {
  // Get the root password
  const type = _.get(service, `lagoon.labels['lando.type']`, 'postgres');
  const user = (type === 'postgres') ? 'lagoon' : 'drupal';
  // Return the stuff
  return {
    'psql': {
      service: ':host',
      description: 'Drops into a PostgreSQL shell on a database service',
      cmd: `psql -U ${user}`,
      user: 'root',
      options: {
        host: {
          description: 'The database service to use',
          default: service.name,
          alias: ['h'],
        },
      },
    },
  };
};

/*
 * Helper to get php related tooling commands
 */
const getPhpCliDrupalTooling = (service, flavor = null) => {
  // Things we need for all php flavors
  const tooling = {
    composer: {service, cmd: '/usr/local/bin/composer --ansi'},
    node: {service},
    npm: {service},
    php: {service, cmd: '/usr/local/bin/php'},
    yarn: {service},
  };

  // Add more based on service
  if (flavor === 'drupal') {
    tooling.drush = {
      env: {
        LAGOON_SSH_KEY: '/user/.ssh/id_lagoon',
      },
      service,
    };
  }

  // Return
  return tooling;
};

/*
 * Helper to map lagoon type data to a lando service
 */
const getServiceToolingByType = service => {
  switch (service.type) {
    case 'lagoon-mariadb': return getMariaDBTooling(service);
    case 'lagoon-postgres': return getPostgreSQLTooling(service);
    case 'lagoon-php-cli': return getPhpCliDrupalTooling(service.name, service.flavor);
    default: return {};
  };
};

/*
 * Adds in DB import/export commands
 */
exports.getDBUtils = service => ({
  'db-import <file>': {
    service: ':host',
    description: 'Imports a dump file into a database service',
    cmd: '/helpers/sql-import.sh',
    user: 'root',
    options: {
      'host': {
        description: 'The database service to use',
        default: service,
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
        default: service,
        alias: ['h'],
      },
      stdout: {
        description: 'Dump database to stdout',
      },
    },
  },
});

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
