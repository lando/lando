/**
 * Lando tomcat service builder
 *
 * @name tomcat
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
   * Supported versions for tomcat (many more available, look at the supported tags list on Docker Hub: https://hub.docker.com/r/library/tomcat/)
   */
  var versions = [
    '7-jre8',
    '8-jre8',
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
   * Build out tomcat
   */
  var services = function(name, config) {

    // Start a services collector
    var services = {};

    // Define config mappings
    var configFiles = {
      serverxmlfile: '/usr/local/tomcat/conf/server.xml',
      webroot: config._mount
    };

    // Add the webroot if its there
    if (_.has(config, 'webroot')) {
      configFiles.webroot = configFiles.webroot + '/' + config.webroot;
    }

    // Default tomcat service
    var tomcat = {
      image: 'tomcat:' + config.version,
      ports: ['8080'],
      environment: {
        TERM: 'xterm',
        LANDO_WEBROOT: configFiles.webroot
      },
      volumes: [],
      command: 'catalina.sh run'
    };

    // Set the default server.xml conf file
    var serverXml = ['tomcat', 'server.xml'];
    var confVol = buildVolume(serverXml, configFiles.serverxmlfile, defaultConfDir);
    tomcat.volumes = addConfig(confVol, tomcat.volumes);

    // Handle ssl option
    if (config.ssl) {

      // Add the SSL port
      tomcat.ports.push('8443');

      // If we don't have a custom default ssl config lets use the default one
      var sslConf = ['tomcat', 'httpd-ssl.conf'];
      var sslVolume = buildVolume(sslConf, configFiles.serverxmlfile, defaultConfDir);
      tomcat.volumes = addConfig(sslVolume, tomcat.volumes);

      // Add in an add cert task
      tomcat.volumes = addScript('add-cert.sh', tomcat.volumes);

    }

    // Handle custom config files
    _.forEach(configFiles, function(file, type) {
      if (_.has(config, 'config.' + type)) {
        var local = config.config[type];
        var customConfig = buildVolume(local, file, '$LANDO_APP_ROOT_BIND');
        tomcat.volumes = addConfig(customConfig, tomcat.volumes);
      }
    });

    // Put it all together
    services[name] = tomcat;

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
