'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var addConfig = lando.utils.services.addConfig;
  var buildVolume = lando.utils.services.buildVolume;

  /*
   * Supported versions for redis
   */
  var versions = [
    '4.0',
    '3.2',
    '3.0',
    '2.8',
    'latest',
    'custom'
  ];

  /*
   * Return the networks needed
   */
  var networks = function() {
    return {};
  };

  /*
   * Build out redis
   */
  var services = function(name, config) {

    // Start a services collector
    var services = {};

    // Define config mappings
    var configFiles = {
      config: '/usr/local/etc/redis/redis.conf'
    };

    // Default redis service
    var redis = {
      image: 'redis:' + config.version,
      environment: {
        TERM: 'xterm'
      },
      command: 'docker-entrypoint.sh redis-server',
    };

    // Persist data if applicable
    if (config.persist) {
      redis.command = redis.command + ' --appendonly yes';
    }

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
        redis.volumes = addConfig(customConfig, redis.volumes);
      }
    });

    // Put it all together
    services[name] = redis;

    // Return our service
    return services;

  };

  /*
   * Return the volumes needed
   */
  var volumes = function() {
    return {data: {}};
  };

  /*
   * Metadata about our service
   */
  var info = function(name, config) {

    // Add in generic info
    var info = {
      'internal_connection': {
        host: name,
        port: config.port || 6379
      },
      'external_connection': {
        host: 'localhost',
        port: config.portforward || 'not forwarded'
      }
    };

    // Show the config files being used if they are custom
    if (!_.isEmpty(config.config)) {
      info.config  = config.config;
    }

    // Return the collected info
    return info;

  };

  return {
    defaultVersion: '4.0',
    info: info,
    networks: networks,
    services: services,
    versions: versions,
    volumes: volumes,
    configDir: __dirname
  };

};
