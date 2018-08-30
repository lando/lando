'use strict';

module.exports = () => {
  /*
   * Supported versions for memcached
   */
  const versions = [
    '1.5',
    '1.4',
    'latest',
    'custom',
  ];

  /*
   * Return the networks needed
   */
  const networks = function() {
    return {};
  };

  /*
   * Build out memcached
   */
  const services = (name, config) => {
    // Start a services collector
    const services = {};

    // Get the memory limit
    const memlimit = config.mem || 64;

    // Default memcached service
    const memcached = {
      image: 'memcached:' + config.version,
      environment: {
        TERM: 'xterm',
      },
      command: 'memcached -m ' + memlimit,
    };

    // Handle port forwarding
    if (config.portforward) {
      // If true assign a port automatically
      if (config.portforward === true) {
        memcached.ports = ['11211'];
      } else {
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
  const volumes = () => {
    return {data: {}};
  };

  /*
   * Metadata about our service
   */
  const info = (name, config) => {
    // Add in generic info
    const info = {
      internal_connection: {
        host: name,
        port: config.port || 11211,
      },
      external_connection: {
        host: 'localhost',
        port: config.portforward || 'not forwarded',
      },
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
    configDir: __dirname,
  };
};
