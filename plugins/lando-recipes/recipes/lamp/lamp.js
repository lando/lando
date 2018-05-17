'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var path = require('path');

  /*
   * Helper to get a CGR commanc
   */
  var getCgr = function(pkg, version) {

    // Add version if needed
    if (!_.isEmpty(version)) {
      pkg = [pkg, version].join(':');
    }

    // Start the collector
    var cgr = [
      'composer',
      'global',
      'require',
      pkg
    ];

    // Return the whole shebang
    return cgr.join(' ');

  };

  /*
   * Helper to download and make a phar executable
   */
  var getPhar = function(url, src, dest, check) {

    // Status checker
    var statusCheck = check || 'true';

    // Arrayify the check if needed
    if (_.isString(statusCheck)) {
      statusCheck = [statusCheck];
    }

    // Phar install command
    var pharInstall = [
      ['cd', '/tmp'],
      ['curl', url, '-L', '-o', src],
      ['chmod', '+x', src],
      statusCheck,
      ['mv', src, dest]
    ];

    // Return
    return _.map(pharInstall, function(cmd) {
      return cmd.join(' ');
    }).join(' && ');

  };

  /*
   * Helper to reset with default config for a new recipe
   * Because we are "extending" this we want to provide this for children
   */
  var resetConfig = function(name, config) {

    // Get the config path
    var configPath = path.join(lando.config.servicesConfigDir, name);

    // Get the database
    var database = _.get(config, 'database', 'mysql');

    // Get the via
    var via = _.get(config, 'via', 'apache');

    // Start an object if we need it
    if (_.isEmpty(config.conf)) {
      config.conf = {};
    }

    // Add in default server config if applicable eg for nginx
    if (!_.has(config, 'conf.server') && _.includes(via, 'nginx')) {
      config.conf.server = path.join(configPath, name + '.conf');
    }

    // Add in default php.ini if applicable
    if (!_.has(config, 'conf.php')) {
      config.conf.php = path.join(configPath, 'php.ini');
    }

    // Add in default mysql config if applicable
    // @TODO: add a custom/optimzed default postgres conf file
    if (!_.has(config, 'conf.database') && !_.includes(database, 'postgres')) {
      config.conf.database = path.join(configPath, 'mysql');
    }

    // Return the mix
    return config;

  };

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
    var phpVersion = _.get(config, 'php', '7.1');
    var database = _.get(config, 'database', 'mysql');

    // Build our default set of services
    var services = {
      appserver: {
        type: 'php:' + phpVersion,
        via: 'apache',
        ssl: _.get(config, 'ssl', true),
        xdebug: _.get(config, 'xdebug', false)
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
        services.database.config.confd = config.conf.database;
      }
    }

    // Return that thang
    return services;

  };

  /*
   * Helper to return tooling config
   */
  var tooling = function(config) {

    // Get our default tooling opts
    var tooling = {
      composer: {
        service: 'appserver',
        description: 'Run composer commands',
        cmd: ['composer', '--ansi']
      },
      'db-import [file]': {
        service: ':host',
        description: 'Import <file> into database service',
        cmd: '/helpers/sql-import.sh',
        options: {
          host: {
            description: 'The database service to use',
            default: 'database',
            alias: ['h']
          },
          'no-wipe': {
            description: 'Do not destroy the existing database before an import'
          }
        }
      },
      'db-export [file]': {
        service: ':host',
        description: 'Export database from a service',
        cmd: '/helpers/sql-export.sh',
        options: {
          host: {
            description: 'The database service to use',
            default: 'database',
            alias: ['h']
          },
          stdout: {
            description: 'Dump database to stdout'
          }
        }
      },
      php: {
        service: 'appserver',
        description: 'Run php commands',
        cmd: ['php']
      }
    };

    // Assess the service types and add the correct command if needed
    var services = _.compact(_.map(config._services, function(service) {
      if (_.has(service, 'type')) {
        return service.type.split(':')[0];
      }
    }));

    // Add the default database type
    services.push(_.get(config, 'database', 'mysql').split(':')[0]);

    // Add in the mysql command if we have mysql dbs
    if (_.includes(services, 'mysql') || _.includes(services, 'mariadb')) {
      tooling.mysql = {
        service: ':host',
        description: 'Drop into a MySQL shell on a database service',
        cmd: 'mysql -u root',
        options: {
          host: {
            description: 'The database service to use',
            default: 'database',
            alias: ['h']
          }
        }
      };
    }

    // Add in the pgsql command if we have mysql dbs
    if (_.includes(services, 'postgres')) {
      tooling.psql = {
        service: ':host',
        description: 'Drop into a psql shell on a database service',
        cmd: 'psql -h localhost -p 5432 -U postgres',
        options: {
          host: {
            description: 'The database service to use',
            default: 'database',
            alias: ['h']
          }
        }
      };
    }

    // Return the toolz
    return tooling;

  };

  /*
   * Build out LAMP
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
    resetConfig: resetConfig,
    getCgr: getCgr,
    getPhar: getPhar
  };

};
