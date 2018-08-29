'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;

  /*
   * Supported versions for apache
   */
  var versions = [
    'latest'
  ];

  /*
   * Return the networks needed
   */
  var networks = function(name, config) {
    return _.get(config, 'networks', {});
  };

  /*
   * Build out node
   */
  var services = function(name, config) {

    // Start a services collector
    var services = {};

    // very basic service defaults.
    var compose = {
      environment: {
        TERM: 'xterm'
      },
      'working_dir': config._mount,
      ports: ['80'],
      expose: ['80'],
      volumes: [],
    };

    // Put it all together
    var composed = _.get(config, 'services', {});
    services[name] = lando.utils.config.merge(compose, composed);

    // Return our service
    return services;

  };

  /*
   * Metadata about our service
   */
  var info = function(name, config) {
    return config;
  };

  /*
   * Return the volumes needed
   */
  var volumes = function(name, config) {
    return lando.utils.config.merge({data: {}}, _.get(config, 'volumes', {}));
  };

  return {
    defaultVersion: 'latest',
    info: info,
    networks: networks,
    services: services,
    versions: versions,
    volumes: volumes,
    configDir: __dirname
  };

};
