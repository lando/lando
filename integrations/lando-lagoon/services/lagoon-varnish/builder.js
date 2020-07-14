'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'lagoon-varnish',
  config: {
    version: 'custom',
    backends: ['nginx'],
    confSrc: __dirname,
    command: '/sbin/tini -- /lagoon/entrypoints.sh /varnish-start.sh',
    moreHttpPorts: ['8080'],
    port: '8080',
  },
  parent: '_lagoon',
  builder: (parent, config) => class LandoLagoonVarnish extends parent {
    constructor(id, options = {}, factory) {
      options = _.merge({}, config, options);

      // Set the meUser
      options.meUser = 'varnish';
      // Ensure the non-root backup perm sweep runs
      // NOTE: we guard against cases where the UID is the same as the bitnami non-root user
      // because this messes things up on circle ci and presumably elsewhere and _should_ be unncessary
      if (_.get(options, '_app._config.uid', '1000') !== '1001') options._app.nonRoot.push(options.name);

      const varnish = {
        command: options.command,
        ports: [options.port],
        depends_on: options.backends,
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
      super(id, options, {services: _.set({}, options.name, varnish)});
    };
  },
};
