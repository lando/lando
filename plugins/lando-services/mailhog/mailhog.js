/**
 * Lando mailhog service builder
 *
 * @name mailhog
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var addConfig = lando.services.addConfig;
  var buildVolume = lando.services.buildVolume;

  /**
   * Supported versions for mailhog
   */
  var versions = [
    'v1.0.0',
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
   * Build out mailhog
   */
  var services = function(name, config) {

    // Start a services collector
    var services = {};

    // @TODO: remove?
    // Define config mappings
    // var configFiles = {
    //   config: '/usr/local/etc/redis/redis.conf'
    // };

    // Default mailhog service
    var mailhog = {
      image: 'mailhog:' + config.version,
      environment: {
        TERM: 'xterm'
      },
      command: 'docker-entrypoint.sh mailhog-server',
    };

    // Persist data if applicable
    if (config.persist) {
      mailhog.command = mailhog.command + ' --appendonly yes';
    }

    // Handle port forwarding
    if (config.portforward) {

      // If true assign a port automatically
      if (config.portforward === true) {
        mailhog.ports = ['1025'];
      }

      // Else use the specified port
      else {
        mailhog.ports = [config.portforward + ':1025'];
      }

    }

    // @TODO: ok to remove?
    // // Handle custom config directory
    // _.forEach(configFiles, function(file, type) {
    //   if (_.has(config, 'config.' + type)) {
    //     var local = config.config[type];
    //     var customConfig = buildVolume(local, file, '$LANDO_APP_ROOT_BIND');
    //     mailhog.volumes = addConfig(customConfig, mailhog.volumes);
    //   }
    // });

    // Put it all together
    services[name] = mailhog;

    // Return our service
    return services;

  };

  /**
   * Return the volumes needed
   */
  var volumes = function() {
    return {data: {}};
  };

  /**
   * Metadata about our service
   */
  var info = function(name, config) {

    // Add in generic info
    var info = {
      'internal_connection': {
        host: name,
        port: config.port || 1025
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
