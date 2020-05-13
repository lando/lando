'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/*
 * Helper to map lagoon type data to a lando service
 */
const getLandoService = name => {
  switch (name) {
    case 'cli': return 'lagoon-php';
    case 'nginx': return 'lagoon-nginx';
    case 'mariadb': return 'lagoon-mariadb';
    case 'php': return 'lagoon-php';
    case 'redis': return 'lagoon-redis';
    case 'solr': return 'lagoon-solr';
    default: return false;
  };
};

/*
 * Helper to get a lagoon envvar with a fallback based on flavor
 */
const getLagoonEnv = (service, key, fallback) => {
  return _.get(service, `lagoon.environment.${key}`, fallback);
};

/*
 * Build Lagoon
 */
module.exports = {
  name: 'lagoon',
  parent: '_recipe',
  config: {
    confSrc: __dirname,
    flavor: 'lagoon',
    build: [],
    proxy: {},
    services: {},
    tooling: {},
  },
  builder: (parent, config) => class LandoLagoon extends parent {
    constructor(id, options = {}) {
      // Get our options
      options = _.merge({}, config, options);

      // Error if we don't have a lagoon.yml
      // @TODO: move this over to the same pattern we have for platform.sh
      // which loads stuff in an init event so its all ready by here
      if (!fs.existsSync(path.join(options.root, '.lagoon.yml'))) {
        throw Error(`Could not detect a .lagoon.yml at ${options.root}`);
      }
      const lagoonConfig = yaml.safeLoad(fs.readFileSync(path.join(options.root, '.lagoon.yml')));

      // Error if we don't have a docker compose
       if (!fs.existsSync(path.join(options.root, lagoonConfig['docker-compose-yaml']))) {
        throw Error(`Could not detect a ${lagoonConfig['docker-compose-yaml']} at ${options.root}`);
      }
      const cConfig = yaml.safeLoad(fs.readFileSync(path.join(options.root, lagoonConfig['docker-compose-yaml'])));

      // Start by injecting the lagoon docker compose config into the corresponding lando services
      _.forEach(cConfig.services, (config, name) => {
        if (getLandoService(name) !== false) {
          options.services[name] = {type: getLandoService(name), lagoon: config};
        }
      });

      // Add cli stuff as needed
      if (_.includes(_.keys(options.services), 'cli')) {
        // Build steps
        options.services.cli.build_internal = options.build;
        // Composer
        options.tooling.composer = {
          service: 'cli',
          cmd: '/usr/local/bin/composer --ansi',
        };
        // Php
        options.tooling.php = {
          service: 'cli',
          cmd: '/usr/local/bin/php',
        };
        // Others that can PATH float
        _.forEach(['drush', 'node', 'npm', 'yarn'], thing => {
          options.tooling[thing] = {
            service: 'cli',
            cmd: thing,
          };
        });
      }

      // Add nginx stuff as needed
      if (_.includes(_.keys(options.services), 'nginx')) {
        options.proxy.nginx = [`${options.app}.${options._app._config.domain}:8080`];
      }

      // Add the php stuff like mailhog service
      // @NOTE: is this only applicable if we have a php service? we assume so for now
      if (_.includes(_.keys(options.services), 'php')) {
        options.services.mailhog = {type: 'mailhog:v1.0.0', hogfrom: ['php']};
        options.proxy.mailhog = [`inbox-${options.app}.${options._app._config.domain}`];
      }

      // Add cli stuff as needed
      if (_.includes(_.keys(options.services), 'mariadb')) {
        // Set creds we can use downstream
        options.services.mariadb.creds = {
          user: getLagoonEnv(options.services.mariadb, 'MARIADB_USER', options.flavor),
          password: getLagoonEnv(options.services.mariadb, 'MARIADB_PASSWORD', options.flavor),
          database: getLagoonEnv(options.services.mariadb, 'MARIADB_DATABASE', options.flavor),
          rootpass: getLagoonEnv(options.services.mariadb, 'MARIADB_ROOT_PASSWORD', 'Lag00n'),
        };
        // MYSQL
        options.tooling.mysql = {
          service: ':host',
          description: 'Drops into a MySQL shell on a database service',
          cmd: `mysql -uroot -p${_.get(options, 'services.mariadb.creds.rootpass', 'Lag00n')}`,
          user: 'root',
          options: {
            host: {
              description: 'The database service to use',
              default: 'mariadb',
              alias: ['h'],
            },
          },
        };
        // DB import
        // @TODO: eventually this should be added separately if we have EITHER postgres or mariadb
        options.tooling['db-import <file>'] = {
          service: ':host',
          description: 'Imports a dump file into a database service',
          cmd: '/helpers/sql-import.sh',
          user: 'root',
          options: {
            'host': {
              description: 'The database service to use',
              default: 'mariadb',
              alias: ['h'],
            },
            'no-wipe': {
              description: 'Do not destroy the existing database before an import',
              boolean: true,
            },
          },
        };
        // DB export
        // @TODO: eventually this should be added separately if we have EITHER postgres or mariadb
        options.tooling['db-export [file]'] = {
          service: ':host',
          description: 'Exports database from a database service to a file',
          cmd: '/helpers/sql-export.sh',
          user: 'root',
          options: {
            host: {
              description: 'The database service to use',
              default: 'mariadb',
              alias: ['h'],
            },
            stdout: {
              description: 'Dump database to stdout',
            },
          },
        };
      };

      // Add a proxy setting for solr if we have it
      if (_.includes(_.keys(options.services), 'solr')) {
        options.proxy.solr = [`solradmin-${options.app}.${options._app._config.domain}:8983`];
      }

      // Send downstream
      super(id, options);
    };
  },
};
