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
    '2.4',
    '2.2',
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
   * Build out apache
   */
  var services = function(name, config) {

    // Start a services collector
    var services = {};

    // Define config mappings
    var configFiles = {
      server: '/usr/local/apache2/conf/httpd.conf',
      webroot: config.mount
    };

    // Add the webroot if its there
    if (_.has(config, 'webroot')) {
      configFiles.webroot = configFiles.webroot + '/' + config.webroot;
    }

    // Default apache service
    var apache = {
      image: 'httpd:' + config.version,
      ports: ['80'],
      environment: {
        TERM: 'xterm',
        LANDO_WEBROOT: configFiles.webroot
      },
      volumes: [],
      command: 'httpd-foreground'
    };

    // Set the default HTTPD conf file
    var httpConf = ['apache', 'httpd.conf'];
    var confVol = buildVolume(httpConf, configFiles.server, defaultConfDir);
    apache.volumes = addConfig(confVol, apache.volumes);

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

    // Put it all together
    services[name] = apache;

    // Return our service
    return services;

  };

  /**
   * Metadata about our service
   */
  var info = function(name, config) {

    // Start up an info collector
    var info = {};

    // Add the webroot
    info.webroot = _.get(config, 'webroot', '.');

    // Show the config files being used if they are custom
    if (!_.isEmpty(config.config)) {
      info.config  = config.config;
    }

    // Return the collected info
    return info;

  };

  /**
   * Return the volumes needed
   */
  var volumes = function() {
    return {data: {}};
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
