'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var addConfig = lando.utils.services.addConfig;
  var buildVolume = lando.utils.services.buildVolume;

  /*
   * Supported versions for mongo
   */
  var versions = [
    '3.5',
    '3.4',
    '3.2',
    '3.0',
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
   * Build out memcached
   */
  var services = function(name, config) {

    // Start a services collector
    var services = {};

    // Default memcached service
    var mongo = {
      image: 'mongo:' + config.version,
      environment: {
        TERM: 'xterm'
      },
      command: 'docker-entrypoint.sh mongod',
    };

    // Handle port forwarding
    if (config.portforward) {

      // If true assign a port automatically
      if (config.portforward === true) {
        mongo.ports = ['27017'];
      }

      // Else use the specified port
      else {
        mongo.ports = [config.portforward + ':27017'];
      }

    }

    // Config file option
    if (_.has(config, 'config')) {

      // Remote file
      var remote = '/config.yml';

      // Mount the config file
      var local = config.config;
      var customConfig = buildVolume(local, remote, '$LANDO_APP_ROOT_BIND');
      mongo.volumes = addConfig(customConfig, mongo.volumes);

      // Augment the command
      mongo.command = mongo.command + ' --config /config.yml';

    }

    // Put it all together
    services[name] = mongo;

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
        port: config.port || 27017
      },
      'external_connection': {
        host: 'localhost',
        port: config.portforward || 'not forwarded'
      }
    };

    // Return the collected info
    return info;

  };

  return {
    defaultVersion: '3.5',
    info: info,
    networks: networks,
    services: services,
    versions: versions,
    volumes: volumes,
    configDir: __dirname
  };

};
