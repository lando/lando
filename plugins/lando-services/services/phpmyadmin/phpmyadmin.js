'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var addConfig = lando.utils.services.addConfig;
  var buildVolume = lando.utils.services.buildVolume;

  /*
   * Supported versions for pma
   */
  var versions = [
    '4.7',
    '4.6',
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
   * Build out mysql
   */
  var services = function(name, config) {

    // Start a services collector
    var services = {};

    // Get the hosts
    var hosts = _.get(config, 'hosts', 'database');

    // Arrayify the hosts if needed
    if (!_.isArray(hosts)) {
      hosts = [hosts];
    }

    // Default pma service
    var pma = {
      image: 'phpmyadmin/phpmyadmin:' + config.version,
      environment: {
        MYSQL_ROOT_PASSWORD: '',
        PMA_HOSTS: hosts.join(','),
        PMA_PORT: 3306,
        PMA_USER: 'root',
        PMA_PASSWORD: '',
        TERM: 'xterm'
      },
      ports: ['80'],
      command: '/run.sh phpmyadmin'
    };

    // Handle custom config file
    if (_.has(config, 'config')) {
      var local = config.config;
      var remote = '/etc/phpmyadmin/config.user.inc.php';
      var customConfig = buildVolume(local, remote, '$LANDO_APP_ROOT_BIND');
      pma.volumes = addConfig(customConfig, pma.volumes);
    }

    // Put it all together
    services[name] = pma;

    // Return our service
    return services;

  };

  /*
   * Return the volumes needed
   */
  var volumes = function() {
    return {};
  };

  /*
   * Metadata about our service
   */
  var info = function() {
    return {};
  };

  return {
    defaultVersion: '4.7',
    info: info,
    networks: networks,
    services: services,
    versions: versions,
    volumes: volumes,
    configDir: __dirname
  };

};
