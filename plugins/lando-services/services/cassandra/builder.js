'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'cassandra',
  config: {
    version: '3.11.5',
    supported: ['3.11.5'],
  },
  parent: '_service',
  builder: (parent, config) => class LandoCassandra extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      const cassandra = {
        image: `bitnami/cassandra:${options.version}`,
        command: '/entrypoint.sh /run.sh',
        environment: {
        },
        volumes: [
          `${options.data}:/bitnami`,
        ],
      };
      super(id, options, {services: _.set({}, options.name, cassandra)});
    };
  },
};
