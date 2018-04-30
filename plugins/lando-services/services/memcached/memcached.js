'use strict';

module.exports = function() {

  /*
   * Supported versions for memcached
   */
  var versions = [
    '1.5',
    '1.4',
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

    // Get the memory limit
    var memlimit = config.mem || 64;

    // Default memcached service
    var memcached = {
      image: 'memcached:' + config.version,
      environment: {
        TERM: 'xterm'
      },
      command: 'memcached -m ' + memlimit,
    };

    // Handle port forwarding
    if (config.portforward) {

      // If true assign a port automatically
      if (config.portforward === true) {
        memcached.ports = ['11211'];
      }

      // Else use the specified port
      else {
        memcached.ports = [config.portforward + ':11211'];
      }

    }

    // Put it all together
    services[name] = memcached;

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
        port: config.port || 11211
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
    defaultVersion: '1.5',
    info: info,
    networks: networks,
    services: services,
    versions: versions,
    volumes: volumes,
    configDir: __dirname
  };

};
