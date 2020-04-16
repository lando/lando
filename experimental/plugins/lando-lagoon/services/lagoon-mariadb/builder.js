'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'lagoon-mariadb',
  config: {
    version: 'custom',
    confSrc: __dirname,
    command: '/sbin/tini -- /lagoon/entrypoints.bash mysqld',
    port: '3306',
    portforward: true,
    creds: {
      user: 'lagoon',
      password: 'lagoon',
      database: 'lagoon',
      rootpass: 'Lag00n',
    },
  },
  parent: '_lagoon',
  builder: (parent, config) => class LandoLagoonMariaDb extends parent {
    constructor(id, options = {}, factory) {
      options = _.merge({}, config, options);
      options.meUser = 'mysql';
      const mariadb = {
        command: options.command,
        environment: {
          // We set these for compatibility with the db-import and db-export scripts
          MYSQL_DATABASE: options.creds.database,
          LANDO_EXTRA_DB_EXPORT_ARGS: `-p${options.creds.rootpass}`,
          LANDO_EXTRA_DB_IMPORT_ARGS: `-p${options.creds.rootpass}`,
        },
        ports: [options.port],
        volumes: [
          `${options.data}:/var/lib/mysql`,
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
      super(id, options, {services: _.set({}, options.name, mariadb)});
    };
  },
};
