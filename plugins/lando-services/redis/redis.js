/**
 * Lando redis service builder
 *
 * @name redis
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var addConfig = lando.services.addConfig;
  var buildVolume = lando.services.buildVolume;

  /**
   * Supported versions for redis
   */
  var versions = [
    '3',
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
   * Build out redis
   */
  var services = function(name, config) {

    // Start a services collector
    var services = {};

    // Define config mappings
    // TODO: Redis ships with default dev conf whithout the need of a conf file.
    // Do we need this configFiles section at all?
    // https://redis.io/topics/config
    // var configFiles = {
    //   confd: '/etc/mysql/conf.d',
    //   dataDir: '/var/lib/mysql'
    // };

    // GEt creds
    var creds = config.creds || {};

    // Default redis service
    var redis = {
      image: 'redis:' + config.version,
      // TODO: do we need env vars for redis?
      // environment: {
      //   MYSQL_USER: creds.user || 'mysql',
      //   MYSQL_PASSWORD: creds.password || 'password',
      //   MYSQL_ALLOW_EMPTY_PASSWORD: 'yes',
      //   MYSQL_DATABASE: creds.database || 'database',
      //   TERM: 'xterm'
      // },
      // TODO: do we need volumes for redis?
      //volumes: ['data:' + configFiles.dataDir],
      command: 'docker-entrypoint.sh redis-server',
    };

    // Handle port forwarding
    if (config.portforward) {

      // If true assign a port automatically
      if (config.portforward === true) {
        redis.ports = ['6379'];
      }

      // Else use the specified port
      else {
        redis.ports = [config.portforward + ':6379'];
      }

    }

    // Handle custom config directory
    _.forEach(configFiles, function(file, type) {
      if (_.has(config, 'config.' + type)) {
        var local = config.config[type];
        var customConfig = buildVolume(local, file, '$LANDO_APP_ROOT_BIND');
        //redis.volumes = addConfig(customConfig, redis.volumes);
      }
    });

    // Put it all together
    services[name] = redis;

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
      // TODO: do we need creds for redis?
      // creds: {
      //   user: config.environment.MYSQL_USER,
      //   password: config.environment.MYSQL_PASSWORD,
      //   database: config.environment.MYSQL_DATABASE
      // },
      'internal_connection': {
        host: name,
        port: 6379
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
