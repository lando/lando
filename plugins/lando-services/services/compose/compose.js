'use strict';

module.exports = lando => {
  // Modules
  const _ = lando.node._;

  /*
   * Supported versions for apache
   */
  const versions = [
    'latest',
  ];

  /*
   * Return the networks needed
   */
  const networks = (name, config) => _.get(config, 'networks', {});

  /*
   * Build out node
   */
  const services = (name, config) => {
    // Start a services collector
    const services = {};

    // very basic service defaults.
    const compose = {
      environment: {
        TERM: 'xterm',
      },
      working_dir: config._mount,
      ports: ['80'],
      expose: ['80'],
      volumes: [],
    };

    // Put it all together
    const composed = _.get(config, 'services', {});
    services[name] = lando.utils.config.merge(compose, composed);

    // Return our service
    return services;
  };

  /*
   * Metadata about our service
   */
  const info = (name, config) => config;

  /*
   * Return the volumes needed
   */
  const volumes = (name, config) => lando.utils.config.merge({data: {}}, _.get(config, 'volumes', {}));

  return {
    defaultVersion: 'latest',
    info: info,
    networks: networks,
    services: services,
    versions: versions,
    volumes: volumes,
    configDir: __dirname,
  };
};
