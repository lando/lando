'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'lagoon-php-cli',
  config: {
    version: 'custom',
    path: [
      '/app/vendor/bin',
      '/usr/local/sbin',
      '/usr/local/bin',
      '/usr/sbin',
      '/usr/bin',
      '/sbin',
      '/bin',
      '/home/.composer/vendor/bin',
    ],
    confSrc: __dirname,
    command: '/sbin/tini -- /lagoon/entrypoints.sh /bin/docker-sleep',
    volumes: ['/usr/local/bin'],
  },
  parent: '_lagoon',
  builder: (parent, config) => class LandoLagoonPhp extends parent {
    constructor(id, options = {}, factory) {
      options = _.merge({}, config, options);

      // Build the cli
      const cli = {
        environment: _.merge({}, options.environment, {
          PATH: options.path.join(':'),
        }),
        volumes: options.volumes,
        command: options.command,
      };

      // Add in the cli service and push downstream
      super(id, options, {services: _.set({}, options.name, cli)});
    };
  },
};
