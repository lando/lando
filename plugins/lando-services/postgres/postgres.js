/**
 * Lando postgres service builder
 *
 * @name postgres
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var addConfig = lando.services.addConfig;
  var buildVolume = lando.services.buildVolume;

  /**
   * Supported versions for mysql
   */
  var versions = [
    '9.6',
    '9.5',
    '9.4',
    '9.3',
    '9.2',
    'latest',
    'custom'
  ];

  /**
   * Return the networks needed
   */
  var networks = function() {
    return {};
  };

  /**
   * Build out mysql
   */
  var services = function(name, config) {

    // Start a services collector
    var services = {};

    // Get data dir
    var ddd = '/var/lib/postgresql/data';
    var dataDir = _.get(config, 'overrides.services.environment.PGDATA', ddd);

    // Define config mappings
    var configFiles = {
      postgres: dataDir + '/postgresql.conf',
      dataDir: dataDir
    };

    // GEt creds
    var creds = config.creds || {};

    // Default postgres service
    var postgres = {
      image: 'postgres:' + config.version,
      environment: {
        POSTGRES_USER: creds.user || 'postgres',
        POSTGRES_PASSWORD: creds.password || 'password',
        POSTGRES_DB: creds.database || 'database',
        TERM: 'xterm'
      },
      // @todo: Persistance of postgres data volume is an issue
      // see: https://github.com/docker-library/postgres/issues/213
      //volumes: ['data:' + configFiles.dataDir],
      command: 'docker-entrypoint.sh postgres',
    };

    // Handle port forwarding
    if (config.portforward) {

      // If true assign a port automatically
      if (config.portforward === true) {
        postgres.ports = ['5432'];
      }

      // Else use the specified port
      else {
        postgres.ports = [config.portforward + ':5432'];
      }

    }

    // Handle custom config directory
    _.forEach(configFiles, function(file, type) {
      if (_.has(config, 'config.' + type)) {
        var local = config.config[type];
        var customConfig = buildVolume(local, file, '$LANDO_APP_ROOT_BIND');
        postgres.volumes = addConfig(customConfig, postgres.volumes);
      }
    });

    // Put it all together
    services[name] = postgres;

    // Return our service
    return services;

  };

  /**
   * Return the volumes needed
   */
  var volumes = function() {
    return {data: {}};
  };

  /**
   * Metadata about our service
   */
  var info = function(name, config) {

    // Add in generic info
    var info = {
      creds: {
        user: config.environment.POSTGRES_USER,
        password: config.environment.POSTGRES_PASSWORD,
        database: config.environment.POSTGRES_DB
      },
      'internal_connection': {
        host: name,
        port: 5432
      },
      'external_connection': {
        host: 'localhost',
        port: config.portforward
      }
    };

    // Return the collected info
    return info;

  };

  return {
    info: info,
    networks: networks,
    services: services,
    versions: versions,
    volumes: volumes,
    configDir: __dirname
  };

};
