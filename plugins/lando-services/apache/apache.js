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
  var buildVolume = lando.services.buildVolume;

  // "Constants"
  var defaultConfDir = lando.config.engineConfigDir;

  /**
   * Supported versions for apache
   */
  var versions = [
    '2',
    '2.2.23',
    '2.2',
    '2.4.25',
    '2.4',
    'latest',
    'custom'
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
      volumes: [],
      command: 'httpd-foreground',
      'volumes_from': ['data']
    };

    // Handle ssl option
    if (config.ssl) {

      // Add the SSL port
      apache.ports.push('443');

      // If we don't have a custom default ssl config lets use the default one
      var sslConf = ['apache', 'httpd-ssl.conf'];
      var sslVolume = buildVolume(sslConf, configFiles.server, defaultConfDir);
      apache.volumes = addConfig(sslVolume, apache.volumes);

      // Add in an add cert task
      apache.volumes = addScript('add-cert.sh', apache.volumes);

    }

    // Handle custom config files
    _.forEach(configFiles, function(file, type) {
      if (_.has(config, 'config.' + type)) {
        var local = config.config[type];
        var customConfig = buildVolume(local, file, '$LANDO_APP_ROOT_BIND');
        apache.volumes = addConfig(customConfig, apache.volumes);
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
