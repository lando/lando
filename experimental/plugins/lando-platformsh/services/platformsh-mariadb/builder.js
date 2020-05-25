'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'platformsh-mariadb',
  config: {
    version: '10.4',
    supported: ['10.4', '10.3', '10.2', '10.1', '10.0', '5.5'],
    legacy: [],
    confSrc: __dirname,
    port: '3306',
  },
  parent: '_platformsh_service',
  builder: (parent, config) => class LandoPlatformshMariaDB extends parent {
    constructor(id, options = {}, factory) {
      options = _.merge({}, config, options);
      // Add 5.5 to the legacy key if this coming from mysql
      if (options.platformsh.type === 'mysql') options.legacy.push('5.5');
      // Build the mariadb
      const mariadb = {
        image: `docker.registry.platform.sh/mariadb-${options.version}`,
        ports: [options.port],
      };
      // Add in the mariadb service and push downstream
      super(id, options, {services: _.set({}, options.name, mariadb)});
    };
  },
};
