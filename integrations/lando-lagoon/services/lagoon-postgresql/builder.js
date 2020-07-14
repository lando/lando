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
      // Ensure the non-root backup perm sweep runs
      // NOTE: we guard against cases where the UID is the same as the bitnami non-root user
      // because this messes things up on circle ci and presumably elsewhere and _should_ be unncessary
      if (_.get(options, '_app._config.uid', '1000') !== '1001') options._app.nonRoot.push(options.name);

      // Make sure we set the creds correctly
      // this is tricky because the user can modify this in their lagoon docker-compose.yaml
      options.creds = {
        user: getLagoonEnv(options, 'POSTGRES_USER', options.flavor),
        password: getLagoonEnv(options, 'POSTGRES_PASSWORD', options.flavor),
        database: getLagoonEnv(options, 'POSTGRES_DB', options.flavor),
      };

      // Build the service
      const postgres = {
        command: options.command,
        environment: {
          // We set these for compatibility with the db-import and db-export scripts
          LANDO_DB_IMPORT_USER: `${options.creds.user}`,
          LANDO_DB_EXPORT_USER: `${options.creds.user}`,
          PGPASSWORD: options.creds.password,
          POSTGRESQL_DATABASE: options.creds.database,
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
