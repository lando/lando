/**
 * Lando mysql service builder
 *
 * @name mysql
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var addConfig = lando.services.addConfig;
  var buildVolume = lando.services.buildVolume;

  /**
   * Supported versions for mysql
   */
  var versions = [
    '8',
    '5.5.53',
    '5.6',
    '5.7',
    '5',
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
   * Build out mysql
   */
  var services = function(name, config) {

    // Start a services collector
    var services = {};

    // Define config mappings
    var configFiles = {
      confd: '/etc/mysql/conf.d',
      dataDir: '/var/lib/mysql'
    };

    // GEt creds
    var creds = config.creds || {};

    // Default mysql service
    var mysql = {
      image: 'mysql:' + config.version,
      environment: {
        MYSQL_USER: creds.user || 'mysql',
        MYSQL_PASSWORD: creds.password || 'password',
        MYSQL_ALLOW_EMPTY_PASSWORD: 'yes',
        MYSQL_DATABASE: creds.database || 'database',
        TERM: 'xterm'
      },
      volumes: ['data:' + configFiles.dataDir],
      command: 'docker-entrypoint.sh mysqld',
    };

    // Handle port forwarding
    if (config.portforward) {

      // If true assign a port automatically
      if (config.portforward === true) {
        mysql.ports = ['3306'];
      }

      // Else use the specified port
      else {
        mysql.ports = [config.portforward + ':3306'];
      }

    }

    // Handle custom config directory
    _.forEach(configFiles, function(file, type) {
      if (_.has(config, 'config.' + type)) {
        var local = config.config[type];
        var customConfig = buildVolume(local, file, '$LANDO_APP_ROOT_BIND');
        mysql.volumes = addConfig(customConfig, mysql.volumes);
      }
    });

    // Put it all together
    services[name] = mysql;

    // Return our service
    return services;

  };

  /**
   * Return the volumes needed
   */
  var volumes = function() {
    return {data: {}};
  };

  return {
    networks: networks,
    services: services,
    versions: versions,
    volumes: volumes,
    configDir: __dirname
  };

};
