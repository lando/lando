/**
 * Lando php service builder
 *
 * @name php
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = require('lodash');
  var addConfig = lando.services.addConfig;

  /**
   * Supported versions for php
   */
  var versions = [
    '5.3',
    '5.5',
    '5.6',
    '7.0',
    'latest',
    'custom'
  ];

  /*
   * Parse our config
   */
  var parseConfig = function(config) {

    // Get the version and type
    var version = config.version || '7.0';
    var type = config.via.split(':')[0] || 'nginx';

    // Define type specific config things
    var typeConfig = {
      nginx: {
        type: type,
        command: ['php-fpm'],
        image: [version, 'fpm'].join('-'),
        serverConf: '/etc/nginx/conf.d/default.conf'
      },
      apache: {
        type: type,
        command: ['apache2-foreground'],
        image: [version, 'apache'].join('-')
      }
    };

    // Add the docker php entrypoint if we are on a supported php version
    if (version.split('.').join('') > 55) {
      typeConfig[type].command.unshift('docker-php-entrypoint');
    }

    // Return type specific config
    return _.merge(config, typeConfig[type]);

  };

  /*
   * Build php
   */
  var php = function(config) {
    return {
      image: 'kalabox/php:' + config.image,
      environment: {
        TERM: 'xterm'
      },
      volumes: [],
      command: config.command.join(' '),
      'volumes_from': ['data']
    };
  };

  /*
   * Build nginx
   */
  var nginx = function(config) {

    // Build base service
    var nginx = {
      image: config.via || 'nginx',
      links: [config.name + '-php:fpm'],
      volumes: [],
      'volumes_from': ['data'],
      command: 'nginx -g "daemon off;"'
    };

    // Add relevant config files
    var defaultConfig = ['php', 'default.conf'];
    var serverFile = config.serverConf;
    nginx.volumes.push(addConfig(defaultConfig, serverFile));

    // Return the relevant service
    return nginx;

  };

  /*
   * Build a starting point for our service
   * lets delegate this since php is complicated
   */
  var buildAppserver = function(config) {

    // Get name and type
    var name = config.name;
    var type = config.type;

    // Start a services collector
    var services = {};

    // Build the correct "appserver"
    services[name] = (type === 'nginx') ? nginx(config) : php(config);

    // Start up the normal ports
    services[name].ports = ['80'];

    // Add fpm backend if we are doing nginx
    if (type === 'nginx') {
      var backend = [name, 'php'].join('-');
      services[backend] = php(config);
    }

    // Return things
    return services;

  };

  /**
   * Build out php
   */
  var builder = function(name, config) {

    // Parse our config
    config.name = name;
    config = parseConfig(config);

    // Get basic services things
    var services = buildAppserver(config);

    // Define config mappings
    var configFiles = {
      webroot: '/var/www/html',
      server: config.serverConf
    };

    // Add the datacontainer
    services.data = {
      image: 'busybox',
      volumes: [configFiles.webroot]
    };

    // Return our service
    return services;

  };

  return {
    builder: builder,
    versions: versions,
    configDir: __dirname
  };

};
