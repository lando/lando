'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'lagoon-nginx',
  config: {
    version: 'custom',
    confSrc: __dirname,
    command: '/sbin/tini -- /lagoon/entrypoints.sh nginx -g "daemon off;"',
    moreHttpPorts: ['8080'],
    ports: ['8080'],
  },
  parent: '_lagoon',
  builder: (parent, config) => class LandoLagoonNginx extends parent {
    constructor(id, options = {}, factory) {
      options = _.merge({}, config, options);

      // Build the nginx
      const nginx = {ports: options.ports, command: options.command};

      // Add in the php service and push downstream
      super(id, options, {services: _.set({}, options.name, nginx)});
    };
  },
};
