'use strict';

// Modules
const _ = require('lodash');
const utils = require('./../../lib/utils');

// Tooling defaults
const toolingDefaults = {
  'composer': {
    service: 'appserver',
    description: 'Run composer commands',
    cmd: 'composer --ansi',
  },
  'db-import [file]': {
    service: ':host',
    description: 'Import <file> into database service',
    cmd: '/helpers/sql-import.sh',
    options: {
      'host': {
        description: 'The database service to use',
        default: 'database',
        alias: ['h'],
      },
      'no-wipe': {
        description: 'Do not destroy the existing database before an import',
        boolean: true,
      },
    },
  },
  'db-export [file]': {
    service: ':host',
    description: 'Export database from a service',
    cmd: '/helpers/sql-export.sh',
    options: {
      host: {
        description: 'The database service to use',
        default: 'database',
        alias: ['h'],
      },
      stdout: {
        description: 'Dump database to stdout',
      },
    },
  },
  'php': {
    service: 'appserver',
    description: 'Run php commands',
    cmd: 'php',
  },
};

/*
 * Helper to get services
 */
const getServices = options => ({
  appserver: {
    build_internal: options.build,
    composer: options.composer,
    config: utils.getServiceConfig(options),
    type: `php:${options.php}`,
    via: options.via,
    ssl: true,
    xdebug: options.xdebug,
    webroot: options.webroot,
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
 * Build L(E)AMP
 */
module.exports = {
  name: '_lamp',
  parent: '_recipe',
  config: {
    confSrc: __dirname,
    database: 'mysql',
    php: '7.2',
    via: 'apache',
    webroot: '.',
    xdebug: false,
  },
  builder: (parent, config) => class LandoLaemp extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      options.services = _.merge({}, getServices(options), options.services);
      options.tooling = _.merge({}, getTooling(options), options.tooling);
      // Switch the proxy if needed
      if (!_.has(options, 'proxyService')) {
        if (_.startsWith(options.via, 'nginx')) options.proxyService = 'appserver_nginx';
        else if (_.startsWith(options.via, 'apache')) options.proxyService = 'appserver';
      }
      options.proxy = _.set({}, options.proxyService, [`${options.app}.${options._app._config.domain}`]);
      super(id, options);
    };
  },
};
