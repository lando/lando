'use strict';

// Modules
const _ = require('lodash');

/*
 * Helper to build a package string
 */
const getPackage = (pkg, version = 'latest') => `${pkg}@${version}`;

/*
 * Helper to get global deps
 * @TODO: this looks pretty testable? should services have libs?
 */
const getGlobalCommands = deps => _(deps)
  .map((version, pkg) => ['npm', 'install', '-g', getPackage(pkg, version)])
  .map(command => command.join(' '))
  .value();

// Builder
module.exports = {
  name: 'node',
  config: {
    version: '10',
    supported: ['11', '11.4', '10', '10.14', '8', '8.14', '6', '6.15'],
    patchesSupported: true,
    legacy: ['8', '6'],
    command: 'tail -f /dev/null',
    path: [
      '/app/node_modules/.bin',
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
      '/usr/local/lib/node_modules',
    ],
  },
  parent: '_appserver',
  builder: (parent, config) => class LandoNode extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      // Make sure our command is an array
      if (!_.isArray(options.command)) options.command = [options.command];
      options.command = options.command.join(' && ');
      // Build the nodez
      const node = {
        image: `node:${options.version}`,
        environment: {
          PATH: options.path.join(':'),
          NODE_EXTRA_CA_CERTS: `/lando/certs/${options._app._config.domain}.pem`,
        },
        ports: (options.command !== 'tail -f /dev/null') ? [80] : [],
        volumes: options.volumes,
        command: `/bin/sh -c "${options.command}"`,
      };

      // Add our npm things to run step
      if (!_.isEmpty(options.globals)) {
        const commands = getGlobalCommands(options.globals);
        const current = _.get(options._app, `config.services.${options.name}.build_internal`, []);
        _.set(options._app, `config.services.${options.name}.build_internal`, _.flatten([commands, current]));
      }

      // Send it downstream
      super(id, options, {
        services: _.set({}, options.name, node),
        volumes: _.set({}, 'data', {}),
      });
    };
  },
};
