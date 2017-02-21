/**
 * Lando php service builder
 *
 * @name php
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var path = require('path');

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

  /**
   * Build out php
   */
  var builder = function(name, config) {

    // Get some config
    var version = config.version || '7.0';
    var via = config.via || 'nginx';

    // Start a services collector
    var services = {};

    // Define config mappings
    var configFiles = {
      webroot: '/var/www/html'
    };

    // Build file
    var dockerDir = path.join([version, via].join('-'));
    var buildFile = path.join(lando.config.engineConfigDir, 'php', dockerDir);

    // Default php service
    var php = {
      //image: 'php:',
      build: buildFile,
      ports: ['80'],
      environment: {
        TERM: 'xterm'
      },
      command: 'docker-php-entrypoint apache2-foreground',
      volumes: [],
      'volumes_from': ['data']
    };

    // Add the data container
    services.data = {
      image: 'busybox',
      volumes: [configFiles.webroot]
    };

    // Put it all together
    services[name] = php;

    // Return our service
    return services;

  };

  return {
    builder: builder,
    versions: versions,
    configDir: __dirname
  };

};
