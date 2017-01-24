/**
 * Lando nginx service builder
 *
 * @name nginx
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;

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
    'latest'
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
      server: '/etc/nginx/conf.d/default.conf'
    };

    // Default nginx service
    var nginx = {
      image: 'nginx:' + config.version,
      ports: ['80'],
      environment: {
        HOME: '/usr/share/nginx/html',
        TERM: 'xterm'
      },
      volumes: [
        '$LANDO_APP_ROOT_BIND:/app',
      ],
      'volumes_from': ['data']
    };

    // Handle ssl option
    if (config.ssl) {
      nginx.ports.push('443');
    }

    // Handle custom config files
    _.forEach(configFiles, function(file, type) {
      if (_.has(config, 'config.' + type)) {
        nginx.volumes.push(lando.services.setConfig(config.config[type], file));
      }
    });

    // Add the data container
    services.data = {
      image: 'busybox',
      volumes: ['/usr/share/nginx/html']
    };

    // Put it all together
    services[name] = nginx;

    // Return our service
    return services;

  };

  return {
    builder: builder,
    versions: versions
  };

};
