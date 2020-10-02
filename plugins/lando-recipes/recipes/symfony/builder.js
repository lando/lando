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

/*
 * Build Symfony
 */
module.exports = {
  name: 'symfony',
  parent: '_lamp',
  config: {
    confSrc: __dirname,
    config: {},
    composer: {},
    database: 'mysql',
    defaultFiles: {
      php: 'php.ini',
    },
    php: '7.4',
    services: {appserver: {overrides: {environment: {
      APP_LOG: 'errorlog',
    }}}},
    tooling: {symfony: {service: 'appserver'}},
    via: 'apache',
    webroot: '.',
    xdebug: false,
  },
  builder: (parent, config) => class LandoSymfony extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      // Add in console tooling
      options.tooling.console = {
        service: 'appserver',
        cmd: `php /app/${options.webroot}/../bin/console`,
      };
      if (_.has(options, 'cache')) options.services.cache = getCache(options.cache);
      // Send downstream
      super(id, options);
    };
  },
};
