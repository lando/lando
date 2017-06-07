/**
 * Lando nginx service builder
 *
 * @name nginx
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
   * Supported versions for nginx
   */
  var versions = [
    '1.13',
    '1.12',
    '1.11',
    '1.10',
    '1.9',
    '1.8',
    'mainline',
    'stable',
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
   * Build out nginx services
   */
  var services = function(name, config) {

    // Start a services collector
    var services = {};

    // Define config mappings
    var configFiles = {
      http: '/etc/nginx/nginx.conf',
      server: '/etc/nginx/conf.d/default.template',
      webroot: config.mount
    };

    // Add the webroot if its there
    if (_.has(config, 'webroot')) {
      configFiles.webroot = configFiles.webroot + '/' + config.webroot;
    }

    // Default nginx service
    var nginx = {
      image: 'nginx:' + config.version,
      ports: ['80'],
      environment: {
        TERM: 'xterm',
        LANDO_WEBROOT: configFiles.webroot,
        LANDO_WEBROOT_USER: 'www-data',
        LANDO_WEBROOT_GROUP: 'www-data'
      },
      volumes: [

      ],
      command: [
        '/bin/sh -c',
        '"envsubst \'$$LANDO_WEBROOT\'',
        '</etc/nginx/conf.d/default.template > /etc/nginx/conf.d/default.conf',
        '&&',
        'nginx -g \'daemon off;\'"'
      ].join(' ')
    };

    // Add in the chown script
    nginx.volumes = addScript('webroot-chown.sh', nginx.volumes);

    // Set the default server conf file
    var serverConf = ['nginx', 'default.conf'];
    var confVol = buildVolume(serverConf, configFiles.server, defaultConfDir);
    nginx.volumes = addConfig(confVol, nginx.volumes);

    // Handle ssl option
    if (config.ssl) {

      // Add the SSL port
      nginx.ports.push('443');

      // If we don't have a custom default ssl config lets use the default one
      var sslConf = ['nginx', 'default-ssl.conf'];
      var sslVolume = buildVolume(sslConf, configFiles.server, defaultConfDir);
      nginx.volumes = addConfig(sslVolume, nginx.volumes);

      // Add in an add cert task
      nginx.volumes = addScript('add-cert.sh', nginx.volumes);

    }

    // Handle custom config files
    _.forEach(configFiles, function(file, type) {
      if (_.has(config, 'config.' + type)) {
        var local = config.config[type];
        var customConfig = buildVolume(local, file, '$LANDO_APP_ROOT_BIND');
        nginx.volumes = addConfig(customConfig, nginx.volumes);
      }
    });

    // Put it all together
    services[name] = nginx;

    // Return our service
    return services;

  };

  /**
   * Metadata about our service
   */
  var info = function(config) {

    // Start up an info collector
    var info = {};

    // Add in the webroot
    info.webroot = _.get(config, 'webroot', '.');

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
