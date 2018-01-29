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

  /**
   * Helper to reset with default config for a new recipe
   * Because we are "extending" this we want to provide this for children
   */
  var resetConfig = function(name, config) {

    // Get the config path
    var configPath = path.join(lando.config.engineConfigDir, name);

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
    // @TODO: add a custom/optimzed default postgres cong file
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
   * Helper to return import tooling route
   * @TODO: Add pgsql cmd at some point
   */
  var dbImport = function() {
    return {
      service: 'appserver',
      needs: ['database'],
      description: 'Import into database.',
      cmd: '/helpers/mysql-import.sh',
      options: {
        host: {
          description: 'The database host',
          alias: ['h']
        },
        user: {
          description: 'The database user',
          default: 'root',
          alias: ['u']
        },
        database: {
          description: 'The database name',
          alias: ['d']
        },
        password: {
          description: 'The database password',
          alias: ['p']
        },
        port: {
          description: 'The database port',
          default: 3306,
          alias: ['P']
        },
        'no-wipe': {
          description: 'Do not destroy the existing database before an import'
        }
      }
    };
  };

  /*
   * Helper to return db-export tooling route
   * @TODO: Add pgsql version of the cmd at some point
   */
  var dbExport = function() {
    return {
      service: 'appserver',
      needs: ['database'],
      description: 'Export a database. Resulting file: {DB_NAME}.TIMESTAMP.gz',
      cmd: '/helpers/mysql-export.sh',
      options: {
        host: {
          description: 'The database host',
          alias: ['h']
        },
        user: {
          description: 'The database user',
          default: 'root',
          alias: ['u']
        },
        database: {
          description: 'The database name',
          alias: ['d']
        },
        password: {
          description: 'The database password',
          alias: ['p']
        },
        port: {
          description: 'The database port',
          default: 3306,
          alias: ['P']
        },
        stdout: {
          description: 'Dump database to stdout'
        }
      }
    };
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
      php: {
        service: 'appserver',
        description: 'Run php commands'
      }
    };

    // Get the database type
    var database = _.get(config, 'database', 'mysql');

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
