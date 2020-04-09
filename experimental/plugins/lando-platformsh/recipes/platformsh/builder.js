'use strict';

/*
 * Build Platform
 */
module.exports = {
  name: 'platformsh',
  parent: '_lamp',
  config: {
    build: [],
    build_root: [],
    run_root: [],
    cache: true,
    confSrc: __dirname,
    defaultFiles: {
      php: 'php.ini',
      database: 'mysql.cnf',
      server: 'nginx.conf.tpl',
    },
    edge: true,
    env: 'dev',
    framework: 'drupal',
    index: true,
    services: {appserver: {overrides: {
      volumes: [],
    }}},
    tooling: {terminus: {
      service: 'appserver',
    }},
    xdebug: false,
    webroot: '.',
  },
  builder: (parent, config) => class LandoPlatformsh extends parent {
    constructor(id, options = {}) {
      // Send downstream
      super(id, options);
    };
  },
};
