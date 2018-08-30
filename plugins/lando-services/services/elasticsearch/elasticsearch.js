'use strict';

module.exports = lando => {
  // Modules
  const _ = lando.node._;
  const addConfig = lando.utils.services.addConfig;
  const buildVolume = lando.utils.services.buildVolume;

  /*
   * Supported versions for elasticsearch
   */
  const versions = [
    '5.5',
    '5.4',
    '5.3',
    '5.2',
    '5.1',
    'latest',
    'custom',
  ];

  /*
   * Return the networks needed
   */
  const networks = () => ({});

  /*
   * Build out elasticsearch
   */
  const services = (name, config) => {
    // Start a services collector
    const services = {};

    // Default elasticsearch service
    const elastic = {
      image: 'itzg/elasticsearch:' + config.version,
      command: '/start',
      environment: {
        'LANDO_NO_SCRIPTS': 'true',
        'TERM': 'xterm',
        'HTTP.HOST': '0.0.0.0',
        'TRANSPORT.HOST': '127.0.0.1',
        'NODE.MASTER': 'false',
        'DISCOVERY.ZEN.PING.UNICAST.HOSTS': 'elasticsearch1',
      },
    };

    // Handle custom vcl file
    if (_.has(config, 'config')) {
      const local = config.config;
      const remote = '/conf/elasticsearch.yml';
      const customConfig = buildVolume(local, remote, '$LANDO_APP_ROOT_BIND');
      elastic.volumes = addConfig(customConfig, elastic.volumes);
    }

    // Handle port forwarding
    if (config.portforward) {
      // If true assign a port automatically
      if (config.portforward === true) {
        elastic.ports = ['9200', '9300'];
      } else {
        const newPort = config.portforward + 100;
        elastic.ports = [config.portforward + ':9200', newPort + ':9300'];
      }
    }

    // Put it all together
    services[name] = elastic;

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
        port: config.port || 9200,
      },
      external_connection: {
        host: 'localhost',
        port: config.portforward || 'not forwarded',
      },
    };

    // Surfaces the config file if specified
    if (_.has(config, 'config')) {
      info.config = config.config;
    }

    // Return the collected info
    return info;
  };

  return {
    defaultVersion: '5.5',
    info: info,
    networks: networks,
    services: services,
    versions: versions,
    volumes: volumes,
    configDir: __dirname,
  };
};
