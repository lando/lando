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
    },
  },
  parent: '_lagoon',
  builder: (parent, config) => class LandoLagoonMariaDb extends parent {
    constructor(id, options = {}, factory) {
      options = _.merge({}, config, options);
      options.meUser = 'root';
      const mariadb = {
        command: options.command,
        environment: {
          // We set this for compatibility with the db-import and db-export scripts
          MYSQL_DATABASE: options.database,
        },
        ports: ['3306'],
      };
      // Add some lando info
      options.info = _.merge({}, options.info, {
        creds: options.creds,
        internal_connection: {
          host: options.name,
          port: options.port,
        },
        external_connection: {
          host: '127.0.0.1',
          port: _.get(options, 'portforward', 'not forwarded'),
        },
      });
      // Send it downstream
      super(id, options, {services: _.set({}, options.name, mariadb)});
    };
  },
};
