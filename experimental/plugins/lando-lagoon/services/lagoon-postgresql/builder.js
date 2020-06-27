'use strict';

// Modules
const _ = require('lodash');
const {getLagoonEnv} = require('../../lib/services');

// Builder
module.exports = {
  name: 'lagoon-postgres',
  config: {
    version: 'custom',
    confSrc: __dirname,
    command: '/sbin/tini -s -- /lagoon/entrypoints.bash /usr/local/bin/docker-entrypoint.sh postgres',
    port: '5432',
    portforward: true,
    creds: {
      user: 'lagoon',
      password: 'lagoon',
      database: 'lagoon',
      rootpass: 'Lag00n',
    },
  },
  parent: '_lagoon',
  builder: (parent, config) => class LandoLagoonPostgres extends parent {
    constructor(id, options = {}, factory) {
      options = _.merge({}, config, options);

      // Set the meUser
      options.meUser = 'postgres';

      // Make sure we set the creds correctly
      // this is tricky because the user can modify this in their lagoon docker-compose.yaml
      const flavor = _.get(options._app, 'config.config.flavor', 'lagoon');
      options.creds = {
        user: getLagoonEnv(options, 'POSTGRES_USER', flavor),
        password: getLagoonEnv(options, 'POSTGRES_PASSWORD', flavor),
        database: getLagoonEnv(options, 'POSTGRES_DB', flavor),
      };

      // Build the service
      const postgres = {
        command: options.command,
        environment: {
          // We set these for compatibility with the db-import and db-export scripts
          POSTGRESQL_DATABASE: options.creds.database,
          LANDO_EXTRA_DB_EXPORT_ARGS: `-p${options.creds.rootpass}`,
          LANDO_EXTRA_DB_IMPORT_ARGS: `-p${options.creds.rootpass}`,
          LANDO_DB_IMPORT_USER: `${options.creds.user}`,
          LANDO_DB_EXPORT_USER: `${options.creds.user}`,
        },
        ports: [options.port],
        volumes: [
          `${options.data}:/var/lib/postgresql/data/pgdata`,
        ],
      };

      // Add some lando info
      options.info = _.merge({}, options.info, {
        creds: options.creds,
        internal_connection: {
          host: options.name,
          port: options.port,
        },
        external_connection: {
          host: options._app._config.bindAddress,
          port: _.get(options, 'portforward', 'not forwarded'),
        },
      });

      // Send it downstream
      super(id, options, {services: _.set({}, options.name, postgres)});
    };
  },
};
