'use strict';

module.exports = function(lando) {

  var versions = [
    'latest'
  ];

  /*
   * Return the networks needed
   */
  var networks = function() {
    return {};
  };

  /*
   * Build out node
   */
  var services = function(name, config) {

    // Start a services collector
    var services = {};

    // very basic service defaults.
    var passthrough = {
      environment: {
        TERM: 'xterm'
      },
      'working_dir': config._mount,
      ports: ['80'],
      expose: ['80'],
      volumes: [],
    };

    // Put it all together
    services[name] = passthrough;

    // Return our service
    return services;

  };

  /*
   * Metadata about our service
   */
  var info = function() {
    return {};
  };

  /*
   * Return the volumes needed
   */
  var volumes = function() {
    return {data: {}};
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
