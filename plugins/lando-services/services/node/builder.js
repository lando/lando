'use strict';

// Modules
const _ = require('lodash');
const utils = require('./../../lib/utils');

/*
 * Helper to build a package string
 */
const pkger = (pkg, version = 'latest') => `${pkg}@${version}`;

// Builder
module.exports = {
  name: 'node',
  config: {
    version: '10',
    supported: ['12', '12.13', '11', '11.4', '10', '10.14', '10.13', '8', '8.14', '6', '6.15'],
    patchesSupported: true,
    legacy: ['8', '6'],
    command: 'tail -f /dev/null',
    moreHttpPorts: [],
    path: [
      '/app/node_modules/.bin',
      '/var/www/.npm-global/bin',
      '/usr/local/sbin',
      '/usr/local/bin',
      '/usr/sbin',
      '/usr/bin',
      '/sbin',
      '/bin',
    ],
    port: '80',
    ssl: false,
    volumes: ['/usr/local/bin', '/usr/local/share'],
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
          NPM_CONFIG_PREFIX: '/var/www/.npm-global',
          LANDO_WEBROOT_USER: 'node',
          LANDO_WEBROOT_GROUP: 'node',
          LANDO_WEBROOT_UID: '1000',
          LANDO_WEBROOT_GID: '1000',
        },
        ports: (options.command !== 'tail -f /dev/null') ? [options.port] : [],
        volumes: options.volumes,
        command: `/bin/sh -c "${options.command}"`,
      };
      // Change the me user
      options.meUser = 'node';
      // Add port to "moreHttpsPorts"
      options.moreHttpPorts.push(options.port);
      // Add our npm things to run step
      if (!_.isEmpty(options.globals)) {
        const commands = utils.getInstallCommands(options.globals, pkger, ['npm', 'install', '-g']);
        utils.addBuildStep(commands, options._app, options.name);
      }
      // Set the sport is ssl is numeric
      if (options.ssl !== false && _.isInteger(options.ssl)) options.sport = options.ssl;
      // Send it downstream
      super(id, options, {services: _.set({}, options.name, node)});
    };
  },
};
