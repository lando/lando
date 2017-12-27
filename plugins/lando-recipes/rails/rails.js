/**
 * LAMP recipe builder
 *
 * @name lamp
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var path = require('path');

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
    var rubyVersion = _.get(config, 'ruby', '2.4');
    var database = _.get(config, 'database', 'postgres');

    // Build our default set of services
    var services = {
      appserver: {
        type: 'ruby:' + rubyVersion + '-rails',
        ssl: _.get(config, 'ssl', true),
        command: ['bundle install', 'bundle exec rails server -b 0.0.0.0 -p 80']
      },
      database: {
        type: database,
        portforward: true,
        creds: {
          user: config._recipe,
          password: config._recipe,
          database: config._recipe
        }
      }
    };

    // Mix in any additional config
    if (_.has(config, 'webroot')) {
      services.appserver.webroot = config.webroot;
    }
    if (_.has(config, 'conf')) {

      // Start setting config
      services.database.config = {};

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
          DB_PORT: (_.includes(database, 'postgres')) ? 5432 : 3306
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
    var tooling = {
      bundle: {
        service: 'appserver',
        description: 'Run bundler commands',
      },
      ruby: {
        service: 'appserver',
        description: 'Run ruby commands'
      },
      irb: {
        service: 'appserver',
        description: 'run the interactive ruby shell'
      },
      rails: {
        service: 'appserver',
        description: 'Run rails commands',
        cmd: ['bundle', 'exec', 'rails']
      },
      gem: {
        service: 'appserver',
        description: ''
      }
    };

    /**
     * Helper to get cache
     */
    var cache = function(cache) {

      // Return redis
      if (_.includes(cache, 'redis')) {
        return {
          type: cache,
          portforward: true,
          persist: true
        };
      }

      // Or memcached
      else if (_.includes(cache, 'memcached')) {
        return {
          type: cache,
          portforward: true
        };
      }

    };


    // Get the database type
    var database = _.get(config, 'database', 'postgres');

    // Add in the DB cli based on choice
    if (_.includes(database, 'mysql') || _.includes(database, 'mariadb')) {
      tooling.mysql = {
        service: 'database',
        description: 'Drop into a MySQL shell',
        user: 'root'
      };
      tooling['db-import [file]'] = dbImport();
      tooling['db-export [file]'] = dbExport();
    }
    // @todo: also need a pgimport cmd
    else if (_.includes(database, 'postgres')) {
      tooling.pgsql = {
        service: 'database',
        description: 'Drop into a pgsql shell',
        cmd: [
          'psql',
          '-h',
          'localhost',
          '-p',
          '5432',
          config._recipe,
          config._recipe
        ],
        user: 'root'
      };
    }

    // Return the toolz
    return tooling;

  };

  /**
   * Build out Rails
   */
  var build = function(name, config) {

    // Start up our build
    var build = {};

    // Get our things
    build.proxy = proxy(name);
    build.services = services(config);
    build.tooling = tooling(config);

    // Return the things
    return build;

  };

  // Return things
  return {
    build: build,
  };

};
