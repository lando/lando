'use strict';

// Modules
const _ = require('lodash');

/*
 * Build CA service
 */
module.exports = {
  name: 'lemp',
  parent: 'lamp',
  config: {
    database: 'mysql',
    confSrc: __dirname,
    config: {},
    php: '7.2',
    proxy: 'appserver_nginx',
    via: 'nginx',
    webroot: '.',
    xdebug: false,
  },
  builder: (parent, config) => class LandoLamp extends parent {
    constructor(id, options = {}) {
      super(id, _.merge({}, config, options));
    };
  },
};
