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

    // Define config mappings
    const configFiles = {
      conf: '/config.yml',
      dataDir: '/data/db',
    };

    // Default memcached service
    const mongo = {
      image: 'mongo:' + config.version,
      environment: {
        TERM: 'xterm',
      },
      volumes: ['data_' + name + ':' + configFiles.dataDir],
      command: 'docker-entrypoint.sh mongod --bind_ip 0.0.0.0',
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

    // Handle custom config directory
    _.forEach(configFiles, (file, type) => {
      if (_.has(config, 'config.' + type)) {
        const local = config.config[type];
        const customConfig = buildVolume(local, file, '$LANDO_APP_ROOT_BIND');
        mongo.volumes = addConfig(customConfig, mongo.volumes);

        if (type === 'conf') {
          // Augment the command
          mongo.command = mongo.command + ' --config ' + file;
        }
      }
    });

    // Put it all together
    services[name] = mongo;

    // Return our service
    return services;
  };

  /*
   * Return the volumes needed
   */
  const volumes = name => {
    const vols = {};
    vols['data_' + name] = {};
    return vols;
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
