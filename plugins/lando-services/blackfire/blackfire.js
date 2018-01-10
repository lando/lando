/**
 * Lando blackfire service builder
 *
 * @name blackfire
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;

  /**
   * Supported versions for blackfire
   */
  var versions = [
    '1.15.0',
    'latest',
    'custom'
  ];

  /**
   * Return the networks needed
   */
  var networks = function() {
    return {};
  };

  /**
   * Build out blackfire
   */
  var services = function(name, config) {

    // Start a services collector
    var services = {};

    // Default blackfire service
    services[name] = {
      image: 'blackfire/blackfire:' + config.version,
      environment: {
        BLACKFIRE_SERVER_ID: process.env.BLACKFIRE_SERVER_ID,
        BLACKFIRE_SERVER_TOKEN: process.env.BLACKFIRE_SERVER_TOKEN
      },
      command: 'blackfire-agent'
    };

    // Return our service
    return services;
  };

  /**
   * Return the volumes needed
   */
  var volumes = function() {
    return {};
  };

  /**
   * Metadata about our service
   */
  var info = function(name, config) {
    return {};
  };

  return {
    info: info,
    networks: networks,
    services: services,
    versions: versions,
    volumes: volumes,
    configDir: __dirname
  };

};
