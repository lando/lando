'use strict';

// Modules
const _ = require('lodash');

/*
 * Build LEMP
 */
module.exports = {
  name: 'lemp',
  parent: '_lamp',
  config: {
    composer: {},
    confSrc: __dirname,
    config: {},
    database: 'mysql',
    php: '7.2',
    services: {},
    tooling: {},
    via: 'nginx',
    webroot: '.',
    xdebug: false,
  },
  builder: (parent, config) => class LandoLemp extends parent {
    constructor(id, options = {}) {
      options.proxy = {appserver_nginx: [`${options.app}.${options._app._config.domain}`]};
      super(id, _.merge({}, config, options));
    };
  },
};
