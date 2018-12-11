'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'ruby',
  config: {
    version: '2.5',
    supported: ['2.6', '2.5', '2.4', '2.3', '1.9'],
    patchesSupported: true,
    legacy: ['1.9'],
    command: 'tail -f /dev/null',
    path: [
      '/usr/local/sbin',
      '/usr/local/bin',
      '/usr/local/bundle/bin',
      '/usr/sbin',
      '/usr/bin',
      '/sbin',
      '/bin',
    ],
    ssl: false,
    volumes: [
      '/usr/local/bin',
      '/usr/local/share',
      '/usr/local/bundle',
    ],
  },
  parent: '_appserver',
  builder: (parent, config) => class LandoRuby extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      // Make sure our command is an array
      if (!_.isArray(options.command)) options.command = [options.command];
      options.command = options.command.join(' && ');
      // Build the nodez
      const ruby = {
        image: `ruby:${options.version}`,
        environment: {
          PATH: options.path.join(':'),
        },
        ports: (options.command !== 'tail -f /dev/null') ? [80] : [],
        volumes: options.volumes,
        command: `/bin/sh -c "${options.command}"`,
      };
      // Send it downstream
      super(id, options, {
        services: _.set({}, options.name, ruby),
        volumes: _.set({}, 'data', {}),
      });
    };
  },
};
