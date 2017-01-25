/**
 * Lando apache service builder
 *
 * @name apache
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var addConfig = lando.services.addConfig;
  var addScript = lando.services.addScript;
  var normalizePath = lando.services.normalizePath;

  /**
   * Supported versions for apache
   */
  var versions = [
    '2',
    '2.2.23',
    '2.2',
    '2.4.25',
    '2.4',
    'latest'
  ];

  /**
   * Build out apache
   */
  var builder = function(name, config) {

    // Start a services collector
    var services = {};

    // Define config mappings
    var configFiles = {
      server: '/usr/local/apache2/conf/httpd.conf',
      webroot: '/usr/local/apache2/htdocs'
    };

    // Default apache service
    var apache = {
      image: 'httpd:' + config.version,
      ports: ['80'],
      environment: {
        TERM: 'xterm'
      },
      command: 'httpd-foreground',
      volumes: [
        '$LANDO_APP_ROOT_BIND:/app',
        '$LANDO_ENGINE_HOME:/user',
      ],
      'volumes_from': ['data']
    };

    // Handle ssl option
    if (config.ssl) {

      // Add the SSL port
      apache.ports.push('443');

      // If we don't have a custom default ssl config lets use the default one
      var defaultSSLConfig = ['apache', 'httpd-ssl.conf'];
      apache.volumes.push(addConfig(defaultSSLConfig, configFiles.server));

      // Add in an add cert task
      apache.volumes.push(addScript('add-cert.sh'));

    }

    // Handle custom config files
    _.forEach(configFiles, function(file, type) {
      if (_.has(config, 'config.' + type)) {
        apache.volumes.push(normalizePath(config.config[type], file));
      }
    });

    // Add the data container
    services.data = {
      image: 'busybox',
      volumes: [configFiles.webroot]
    };

    // Put it all together
    services[name] = apache;

    // Return our service
    return services;

  };

  return {
    builder: builder,
    versions: versions,
    configDir: __dirname
  };

};
