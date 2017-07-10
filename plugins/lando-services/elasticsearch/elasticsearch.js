/**
 * Lando elasticsearch service builder
 *
 * @name elasticsearch
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var addConfig = lando.services.addConfig;
  var buildVolume = lando.services.buildVolume;

  /**
   * Supported versions for elasticsearch
   */
  var versions = [
    '5.5.0',
  ];

  /**
   * Return the networks needed
   */
  var networks = function() {
    return {};
  };

  /**
   * Build out elasticsearch
   */
  var services = function(name, config) {

    // Start a services collector
    var services = {};

    // Get creds
    var creds = config.creds || {};

    // Default elasticsearch service
    var elastic = {
      image: 'docker.elastic.co/elasticsearch/elasticsearch:' + config.version,
      command: '/usr/share/elasticsearch/bin/elasticsearch',
      environment: {
        LANDO_NO_SCRIPTS: 'true',
        TERM: 'xterm',
        'HTTP.HOST': '0.0.0.0',
        'TRANSPORT.HOST': '127.0.0.1',
        'NODE.MASTER': 'false',
        'DISCOVERY.ZEN.PING.UNICAST.HOSTS': 'elasticsearch1'
      },
    };

    // Handle port forwarding
    if (config.portforward) {

      // If true assign a port automatically
      if (config.portforward === true) {
        elastic.ports = ['9200'];
      }

      // Else use the specified port
      else {
        elastic.ports = [config.portforward + ':9200'];
      }

    }

    // Put it all together
    services[name] = elastic;

    // Return our service
    return services;

  };

  /**
   * Return the volumes needed
   */
  var volumes = function(name) {
    return {data: {}};
  };

  /**
   * Metadata about our service
   */
  var info = function(name, config) {

    // Add in generic info
    var info = {
      creds: {
        // @todo.
      },
      'internal_connection': {
        host: name,
        port: config.port || 3306
      },
      'external_connection': {
        host: 'localhost',
        port: config.portforward || 'not forwarded'
      }
    };

    // Show the config files being used if they are custom
    if (!_.isEmpty(config.config)) {
      info.config  = config.config;
    }

    // Return the collected info
    return info;

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
