'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'python',
  config: {
    version: '3.7',
    supported: ['3', '3.7', '3.6', '3.5', '2.7'],
    patchesSupported: true,
    legacy: ['2.7'],
    command: 'tail -f /dev/null',
    path: [
      '/var/www/.local/bin',
      '/usr/local/sbin',
      '/usr/local/bin',
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
  builder: (parent, config) => class LandoPython extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      // Make sure our command is an array
      if (!_.isArray(options.command)) options.command = [options.command];
      options.command = options.command.join(' && ');
      // Add our volumes
      volumes.push([
        `data_${options.name}:/var/www/.cache/pip`,
        `data_${options.name}:/var/www/.local/bin`,
      ]);
      // Build the nodez
      const python = {
        image: `python:${options.version}`,
        environment: {
          PATH: options.path.join(':'),
          PIP_USER: 'true',
          PYTHONUSERBASE: '/var/www/.local/bin',
        },
        ports: (options.command !== 'tail -f /dev/null') ? ['80'] : [],
        volumes: options.volumes,
        command: `/bin/sh -c "${options.command}"`,
      };
      // Send it downstream
      super(id, options, {services: _.set({}, options.name, python)});
    };
  },
};
