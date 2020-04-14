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
  },
  parent: '_lagoon',
  builder: (parent, config) => class LandoLagoonMariaDb extends parent {
    constructor(id, options = {}, factory) {
      options = _.merge({}, config, options);
      const mariadb = {
        command: options.command,
      };
      // Send it downstream
      super(id, options, {services: _.set({}, options.name, mariadb)});
    };
  },
};
