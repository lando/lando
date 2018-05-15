'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;

  /*
   * Helper to return proxy config
   */
  var proxy = function(name) {
    return {
      appserver: [
        [name, lando.config.proxyDomain].join('.')
      ]
    };
  };

  /*
   * Helper to return services config
   */
  var services = function(config) {

    // Get some options
    var nodeVersion = _.get(config, 'node', '6.10');
    var mongoVersion = _.get(config, 'mongo', '3.5');

    // Build our default set of services
    var services = {
      appserver: {
        type: 'node:' + nodeVersion,
        command: _.get(config, 'command', 'npm start'),
      },
      database: {
        type: 'mongo:' + mongoVersion,
        portforward: true,
      }
    };

    // Mix in any additional config
    if (_.has(config, 'conf')) {

      // Start setting config
      services.database.config = {};

      // Set custom db conf
      if (_.has(config, 'conf.database')) {
        services.database.config = config.conf.database;
      }

    }

    // Mix in globals
    if (_.has(config, 'globals')) {
      services.appserver.globals = config.globals;
    }

    // Return that thang
    return services;

  };

  /*
   * Helper to return tooling config
   */
  var tooling = function() {

    // Get our default tooling opts
    var tooling = {
      node: {
        service: 'appserver_cli'
      },
      npm: {
        service: 'appserver_cli'
      },
      yarn: {
        service: 'appserver_cli'
      },
      mongo: {
        service: 'database',
        description: 'Drop into the mongo shell'
      }
    };

    // Return the toolz
    return tooling;

  };

  /*
   * Build out MEAN
   */
  var build = function(name, config) {

    // Start up our build
    var build = {};

    // Get our things
    build.proxy = proxy(name);
    build.services = services(config);
    build.tooling = tooling();

    // Return the things
    return build;

  };

  // Return things
  return {
    build: build,
    configDir: __dirname,
    webroot: false
  };

};
