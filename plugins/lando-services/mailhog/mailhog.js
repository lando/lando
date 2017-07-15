/**
 * Lando mailhog service builder
 *
 * @name mailhog
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  //var addConfig = lando.services.addConfig;
  //var buildVolume = lando.services.buildVolume;

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

    // Get the hostname
    var hostname = [name, lando.config.proxyDomain].join('.');

    // Default mailhog service
    var mailhog = {
      image: 'mailhog/mailhog:' + config.version,
      user: 'root',
      environment: {
        TERM: 'xterm',
        LANDO_NO_SCRIPTS: 'true',
        MH_API_BIND_ADDR: ':80',
        //MH_API_HOST: 'http://localhost:80/',
        MH_HOSTNAME: hostname,
        MH_UI_BIND_ADDR: ':80'
      },
      ports: ['80'],
      command: 'MailHog'
    };

    /*
    var exposed = {'local_smtp_port': 1025, 'local_http_port': 8025};
    var ports = [];

    _.forEach(exposed, function (value, key) {

      if (config[key]) {

        if (config[key] === true) {
          ports.push(value);
        }
        else {
          ports.push(config[key] + ':' + value);
        }

      }

    });

    if (!_.isEmpty(ports)) {
      mailhog.ports = ports
    }
    */

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
