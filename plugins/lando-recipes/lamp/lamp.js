/**
 * LAMP recipe builder
 *
 * @name lamp
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;

  /*
   * Helper to return sharing config
   */
  var sharing = function() {
    return {
      appserver: {
        remote: '/var/www/html'
      }
    };
  };

  /*
   * Helper to return proxy config
   */
  var proxy = function() {
    return {
      appserver: [
        {port: '80/tcp', default: true},
        {port: '443/tcp', default: true, secure: true}
      ]
    };
  };

  /*
   * Helper to return services config
   */
  var services = function(config) {

    // Get some options
    var phpVersion = _.get(config, 'php', '7.1');
    var database = _.get(config, 'database', 'mysql');

    // Build our default set of services
    var services = {
      appserver: {
        type: 'php:' + phpVersion,
        via: 'apache',
        ssl: true
      },
      database: {
        type: database,
        portforward: true,
        creds: {
          user: 'database',
          password: 'database',
          database: 'database'
        }
      }
    };

    // Mix in any additional config
    if (_.has(config, 'webroot')) {
      services.appserver.webroot = config.webroot;
    }
    if (_.has(config, 'conf')) {

      // Start setting config
      services.appserver.config = {};
      services.database.config = {};

      // Set custom server conf
      if (_.has(config, 'conf.server')) {
        services.appserver.config.server = config.conf.server;
      }

      // Set custom php conf
      if (_.has(config, 'conf.php')) {
        services.appserver.config.conf = config.conf.php;
      }

      // Set custom DB conf
      if (_.has(config, 'conf.database')) {
        var confKey = (_.includes(database, 'postgres')) ? 'postgres' : 'confd';
        services.database.config[confKey] = config.conf.database;
      }
    }

    // Add db credentials into the ENV
    services.appserver.overrides = {
      services: {
        environment: {
          DB_HOST: 'database',
          DB_USER: services.database.creds.user,
          DB_PASSWORD: services.database.creds.password,
          DB_NAME: services.database.creds.database,
          DB_PORT: 3306
        }
      }
    };

    // Return that thang
    return services;

  };

  /*
   * Helper to return tooling config
   */
  var tooling = function(config) {

    // Get our default tooling opts
    var  tooling = {
      composer: {
        service: 'appserver',
        description: 'Run composer commands',
        cmd: ['composer', '--ansi'],
        user: 'www-data'
      },
      php: {
        service: 'appserver',
        description: 'Run php commands',
        user: 'www-data'
      }
    };

    // Get the database type
    var database = _.get(config, 'database', 'mysql');

    // Add in the DB cli based on choice
    if (_.includes(database, 'mysql') || _.includes(database, 'mariadb')) {
      tooling.mysql = {
        service: 'database',
        description: 'Drop into a MySQL shell'
      };
    }
    else if (_.includes(database, 'postgres')) {
      tooling.pgsql = {
        service: 'database',
        description: 'Drop into a pgsql shell',
        cmd: ['psql', '-h', 'localhost', '-p', '5432', 'database', 'database']
      };
    }

    // Return the toolz
    return tooling;

  };

  /**
   * Build out LAMP
   */
  var build = function(name, config) {

    // Start up our build
    var build = {};

    // Get our things
    build.sharing = sharing();
    build.proxy = proxy();
    build.services = services(config);
    build.tooling = tooling(config);

    // Return the things
    return build;

  };

  // Return things
  return {
    build: build
  };

};
