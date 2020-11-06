'use strict';

// Modules
const _ = require('lodash');

/*
 * Helper to get cache
 */
const getCache = cache => {
  // Return redis
  if (_.includes(cache, 'redis')) {
    return {
      type: cache,
      portforward: true,
      persist: true,
    };
  // Or memcached
  } else if (_.includes(cache, 'memcached')) {
    return {
      type: cache,
      portforward: true,
    };
  }
};

const getNode = node => {
  // Return redis
  if (_.includes(node, true)) {
    return {
      type: `node:${options.node}`,
      command: options.command,
      build_internal: options.build,
      globals: options.globals,
      port: options.port,
      ssl: options.ssl,
    };
    // Or memcached
  };
};

/*
 * Build Laravel
 */
module.exports = {
  name: 'craft',
  parent: '_lamp',
  config: {
    confSrc: __dirname,
    config: {},
    composer: {},
    database: 'mysql',
    defaultFiles: {
      php: 'php.ini',
    },
    php: '7.3',
    services: {appserver: {overrides: {environment: {
      APP_LOG: 'errorlog',
    }}}},
    tooling: {craft: {service: 'appserver'}},
    via: 'apache',
    webroot: 'web',
    xdebug: false,
  },
  builder: (parent, config) => class LandoLaravel extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      // Add the laravel cli installer command
      options.composer['laravel/installer'] = '*';
      // Add in artisan tooling
      // @NOTE: does artisan always live one up of the webroot?
      options.tooling.craft = {
        service: 'appserver',
        cmd: `php /app/${options.webroot}/../craft`,
      };
      if (_.has(options, 'cache') && options.cache !== 'none') {
        options.services.cache = getCache(options.cache);
      }
      // Send downstream
      super(id, options);
    };
  },
};
