'use strict';

// Modules
const _ = require('lodash');

/*
 * Build LAMP
 */
module.exports = {
  name: 'lamp',
  parent: '_lamp',
  config: {
    composer: {},
    confSrc: __dirname,
    config: {},
    database: 'mysql',
    php: '7.2',
    services: {},
    tooling: {},
    via: 'apache',
    webroot: '.',
    xdebug: false,
  },
  builder: (parent, config) => class LandoLamp extends parent {
    constructor(id, options = {}) {
      options.proxy = {appserver: [`${options.app}.${options._app._config.domain}`]};
      super(id, _.merge({}, config, options));
    };
  },
};
