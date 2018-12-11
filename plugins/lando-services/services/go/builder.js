'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'go',
  config: {
    version: '1.11',
    supported: ['1.11', '1.10'],
    patchesSupported: true,
    legacy: ['1.9', '1.8'],
    command: 'tail -f /dev/null',
    ssl: false,
  },
  parent: '_appserver',
  builder: (parent, config) => class LandoGo extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      // Make sure our command is an array
      if (!_.isArray(options.command)) options.command = [options.command];
      options.command = options.command.join(' && ');
      // Build the goz
      const go = {
        image: `golang:${options.version}`,
        ports: (options.command !== 'tail -f /dev/null') ? ['80'] : [],
        command: `/bin/sh -c "${options.command}"`,
      };
      // Send it downstream
      super(id, options, {
        services: _.set({}, options.name, go),
        volumes: _.set({}, 'data', {}),
      });
    };
  },
};
