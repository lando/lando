'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'lagoon-elasticsearch',
  config: {
    version: 'custom',
    confSrc: __dirname,
    command: '/sbin/tini -- /lagoon/entrypoints.bash /usr/local/bin/docker-entrypoint.sh',
    port: '9200',
    portforward: true,
    moreHttpPorts: ['9200'],
  },
  parent: '_lagoon',
  builder: (parent, config) => class LandoLagoonElasticsearch extends parent {
    constructor(id, options = {}, factory) {
      options = _.merge({}, config, options);

      // Set the meUser
      options.meUser = 'elasticsearch';
      // Ensure the non-root backup perm sweep runs
      // NOTE: we guard against cases where the UID is the same as the bitnami non-root user
      // because this messes things up on circle ci and presumably elsewhere and _should_ be unncessary
      if (_.get(options, '_app._config.uid', '1000') !== '1001') options._app.nonRoot.push(options.name);

      const elasticsearch = {
        command: options.command,
        ports: [options.port],
        volumes: [
          `${options.data}:/usr/share/elasticsearch/data`,
        ],
      };
      // Add some lando info
      options.info = _.merge({}, options.info, {
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
      super(id, options, {services: _.set({}, options.name, elasticsearch)});
    };
  },
};
