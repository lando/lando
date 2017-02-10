/**
 * Lando mariadb service builder
 *
 * @name mariadb
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var normalizePath = lando.services.normalizePath;

  /**
   * Supported versions for mariadb
   */
  var versions = [
    '10',
    '10.1',
    '10.1.21',
    '10.0.29',
    '10.0',
    '5.5.54',
    '5.5',
    '5',
    'latest',
    'custom'
  ];

  /**
   * Build out mariadb
   */
  var builder = function(name, config) {

    // Start a services collector
    var services = {};

    // Define config mappings
    var configFiles = {
      confd: '/etc/mysql/conf.d',
      dataDir: '/var/lib/mysql'
    };

    // GEt creds
    var creds = config.creds || {};

    // Default mariadb service
    var mariadb = {
      image: 'mariadb:' + config.version,
      environment: {
        MYSQL_USER: creds.user || 'mariadb',
        MYSQL_PASSWORD: creds.password || 'password',
        MYSQL_ALLOW_EMPTY_PASSWORD: 'yes',
        MYSQL_DATABASE: creds.database || 'database',
        TERM: 'xterm'
      },
      volumes: [],
      command: 'docker-entrypoint.sh mysqld',
      'volumes_from': ['data']
    };

    // Handle port forwarding
    if (config.portforward) {

      // If true assign a port automatically
      if (config.portforward === true) {
        mariadb.ports = ['3306'];
      }

      // Else use the specified port
      else {
        mariadb.ports = [config.portforward + ':3306'];
      }

    }

    // Handle custom config directory
    _.forEach(configFiles, function(file, type) {
      if (_.has(config, 'config.' + type)) {
        mariadb.volumes.push(normalizePath(config.config[type], file));
      }
    });

    // Add the data container
    services.data = {
      image: 'busybox',
      volumes: [configFiles.dataDir]
    };

    // Put it all together
    services[name] = mariadb;

    // Return our service
    return services;

  };

  return {
    builder: builder,
    versions: versions,
    configDir: __dirname
  };

};
