'use strict';

module.exports = lando => {
  // Modules
  const _ = lando.node._;
  const addConfig = lando.utils.services.addConfig;
  const buildVolume = lando.utils.services.buildVolume;

  /*
   * Supported versions for mongo
   */
  const versions = [
    '3.5',
    '3.4',
    '3.2',
    '3.0',
    'latest',
    'custom',
  ];

  /*
   * Return the networks needed
   */
  const networks = () => ({});

  /*
   * Build out memcached
   */
  const services = (name, config) => {
    // Start a services collector
    const services = {};

    // Default memcached service
    const mongo = {
      image: 'mongo:' + config.version,
      environment: {
        TERM: 'xterm',
      },
      command: 'docker-entrypoint.sh mongod',
    };

    // Handle port forwarding
    if (config.portforward) {
      // If true assign a port automatically
      if (config.portforward === true) {
        mongo.ports = ['27017'];
      } else {
        mongo.ports = [config.portforward + ':27017'];
      }
    }

    // Config file option
    if (_.has(config, 'config')) {
      // Remote file
      const remote = '/config.yml';

      // Mount the config file
      const local = config.config;
      const customConfig = buildVolume(local, remote, '$LANDO_APP_ROOT_BIND');
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
        port: config.port || 27017,
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
    defaultVersion: '3.5',
    info: info,
    networks: networks,
    services: services,
    versions: versions,
    volumes: volumes,
    configDir: __dirname,
  };
};
