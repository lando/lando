'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'lagoon-solr',
  config: {
    version: 'custom',
    confSrc: __dirname,
    command: '/sbin/tini -- /lagoon/entrypoints.sh solr-foreground',
    port: '8983',
    portforward: true,
    moreHttpPorts: ['8983'],
  },
  parent: '_lagoon',
  builder: (parent, config) => class LandoLagoonSolr extends parent {
    constructor(id, options = {}, factory) {
      options = _.merge({}, config, options);
      options.meUser = 'solr';
      const solr = {
        command: options.command,
        ports: [options.port],
        volumes: [
          `${options.data}:/var/solr`,
        ],
      };
      // Add some lando info
      options.info = _.merge({}, options.info, {
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
      super(id, options, {services: _.set({}, options.name, solr)});
    };
  },
};
