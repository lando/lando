'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const utils = require('./../../lib/utils');

// Tooling defaults
const toolingDefaults = {
  'composer': {
    service: 'appserver',
    cmd: 'composer --ansi',
  },
  'db-import <file>': {
    service: ':host',
    description: 'Imports a dump file into a database service',
    cmd: '/helpers/sql-import.sh',
    user: 'root',
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
    description: 'Exports database from a database service to a file',
    cmd: '/helpers/sql-export.sh',
    user: 'root',
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
    cmd: 'php',
  },
};

/*
 * Helper to get config defaults
 */
const getConfigDefaults = options => {
  // Get the viaconf
  if (_.startsWith(options.via, 'nginx')) options.defaultFiles.vhosts = 'default.conf.tpl';

  // Get the default db conf
  const dbConfig = _.get(options, 'database', 'mysql');
  const database = _.first(dbConfig.split(':'));
  const version = _.last(dbConfig.split(':'));
  if (database === 'mysql' || database === 'mariadb') {
    if (version === '8.0') {
      options.defaultFiles.database = 'mysql8.cnf';
    } else {
      options.defaultFiles.database = 'mysql.cnf';
    }
  }

  // Verify files exist and remove if it doesn't
  _.forEach(options.defaultFiles, (file, type) => {
    if (!fs.existsSync(`${options.confDest}/${file}`)) {
      delete options.defaultFiles[type];
    }
  });

  // Return
  return options.defaultFiles;
};

/*
 * Helper to get services
 */
const getServices = options => ({
  appserver: {
    build_as_root_internal: options.build_root,
    build_internal: options.build,
    composer: options.composer,
    config: utils.getServiceConfig(options),
    run_as_root_internal: options.run_root,
    ssl: true,
    type: `php:${options.php}`,
    via: options.via,
    xdebug: options.xdebug,
    webroot: options.webroot,
  },
  database: {
    config: utils.getServiceConfig(options, ['database']),
    authentication: 'mysql_native_password',
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
    defaultFiles: {},
    php: '7.3',
    via: 'apache',
    webroot: '.',
    xdebug: false,
  },
  builder: (parent, config) => class LandoLaemp extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      // Rebase on top of any default config we might already have
      options.defaultFiles = _.merge({}, getConfigDefaults(_.cloneDeep(options)), options.defaultFiles);
      options.services = _.merge({}, getServices(options), options.services);
      options.tooling = _.merge({}, getTooling(options), options.tooling);
      // Switch the proxy if needed
      if (!_.has(options, 'proxyService')) {
        if (_.startsWith(options.via, 'nginx')) options.proxyService = 'appserver_nginx';
        else if (_.startsWith(options.via, 'apache')) options.proxyService = 'appserver';
      }
      options.proxy = _.set({}, options.proxyService, [`${options.app}.${options._app._config.domain}`]);
      // Downstream
      super(id, options);
    };
  },
};
