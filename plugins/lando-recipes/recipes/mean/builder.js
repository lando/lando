'use strict';

// Modules
const _ = require('lodash');
const utils = require('./../../lib/utils');

// Tooling defaults
const toolingDefaults = {
  node: {service: 'appserver'},
  npm: {service: 'appserver'},
  yarn: {service: 'appserver'},
};

/*
 * Helper to get services
 */
const getServices = options => ({
  appserver: {
    type: `node:${options.node}`,
    command: options.command,
    globals: options.globals,
    ssl: options.ssl,
  },
  database: {
    config: utils.getServiceConfig(options, ['database']),
    type: options.database,
    portforward: true,
    creds: {
      user: options.recipe,
      password: options.recipe,
      database: options.recipe,
    },
  },
});

/*
 * Helper to get tooling
 */
const getTooling = options => _.merge({}, toolingDefaults, utils.getDbTooling(options.database));

/*
 * Build MEAN
 */
module.exports = {
  name: 'mean',
  parent: '_recipe',
  config: {
    config: {},
    confSrc: __dirname,
    command: 'npm start',
    database: 'mongo',
    globals: {},
    node: '10',
    ssl: false,
  },
  builder: (parent, config) => class LandoMean extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      options.services = _.merge({}, getServices(options), options.services);
      options.tooling = _.merge({}, getTooling(options), options.tooling);
      options.proxy = _.set({}, 'appserver', [`${options.app}.${options._app._config.domain}`]);
      super(id, options);
    };
  },
};
