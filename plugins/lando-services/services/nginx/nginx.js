'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var addConfig = lando.utils.services.addConfig;
  var buildVolume = lando.utils.services.buildVolume;

  // "Constants"
  var scd = lando.config.servicesConfigDir;

  /*
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

  /*
   * Return the networks needed
   */
  var networks = function() {
    return {};
  };

  /*
   * Build out nginx services
   */
  var services = function(name, config) {

    // Start a services collector
    var services = {};

    // Define config mappings
    var configFiles = {
      http: '/etc/nginx/nginx.conf',
      server: '/etc/nginx/conf.d/default.template',
      params: '/etc/nginx/fastcgi_params',
      webroot: config._mount
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
        LANDO_WEBROOT: configFiles.webroot
      },
      volumes: [],
      command: [
        '/bin/sh -c',
        '"envsubst \'$$LANDO_WEBROOT\'',
        '</etc/nginx/conf.d/default.template > /etc/nginx/conf.d/default.conf',
        '&&',
        'nginx -g \'daemon off;\'"'
      ].join(' ')
    };

    // Set the default http conf file
    var httpConf = ['nginx', 'nginx.conf'];
    var httpVol = buildVolume(httpConf, configFiles.http, scd);
    nginx.volumes = addConfig(httpVol, nginx.volumes);

    // Set the default server conf file
    var serverConf = ['nginx', 'default.conf'];
    var serverVol = buildVolume(serverConf, configFiles.server, scd);
    nginx.volumes = addConfig(serverVol, nginx.volumes);

    // Set the default params conf file
    var paramConf = ['nginx', 'fastcgi_params'];
    var paramVol = buildVolume(paramConf, configFiles.params, scd);
    nginx.volumes = addConfig(paramVol, nginx.volumes);

    // Handle ssl option
    if (config.ssl) {

      // Add the SSL port
      nginx.ports.push('443');

      // If we don't have a custom default ssl config lets use the default one
      var sslConf = ['nginx', 'default-ssl.conf'];
      var sslVolume = buildVolume(sslConf, configFiles.server, scd);
      nginx.volumes = addConfig(sslVolume, nginx.volumes);

      // Add a healthcheck so we wait until open-ssl gets installed
      nginx.healthcheck = {
        test: 'dpkg -s openssl',
        interval: '2s',
        timeout: '10s',
        retries: 25
      };

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

  /*
   * Metadata about our service
   */
  var info = function(name, config) {

    // Start up an info collector
    var info = {};

    // Add in the webroot
    info.webroot = _.get(config, 'webroot', '.');

    // Show the config files being used if they are custom
    if (!_.isEmpty(config.config)) {
      info.config  = config.config;
    }

    // Return the collected info
    return info;

  };

  /*
   * Return the volumes needed
   */
  var volumes = function() {
    return {data: {}};
  };

  return {
    defaultVersion: '1.13',
    info: info,
    networks: networks,
    services: services,
    versions: versions,
    volumes: volumes,
    configDir: __dirname
  };

};
