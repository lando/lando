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
    '1.8.1',
    '1.10.2',
    '1.10',
    'stable',
    '1.11.8',
    '1',
    '1.11',
    'mainline',
    'latest',
    'custom'
  ];

  /**
   * Build out nginx
   */
  var builder = function(name, config) {

    // Start a services collector
    var services = {};

    // Define config mappings
    var configFiles = {
      http: '/etc/nginx/nginx.conf',
      server: '/etc/nginx/conf.d/default.conf',
      webroot: '/usr/share/nginx/html'
    };

    // Default nginx service
    var nginx = {
      image: 'nginx:' + config.version,
      ports: ['80'],
      environment: {
        TERM: 'xterm'
      },
      volumes: [],
      command: 'nginx -g "daemon off;"',
      'volumes_from': ['data']
    };

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

    // Add the data container
    services.data = {
      image: 'busybox',
      volumes: [configFiles.webroot]
    };

    // Put it all together
    services[name] = nginx;

    // Return our service
    return services;

  };

  return {
    builder: builder,
    versions: versions,
    configDir: __dirname
  };

};
