'use strict';

module.exports = lando => {
  // Modules
  const _ = lando.node._;
  const addConfig = lando.utils.services.addConfig;
  const buildVolume = lando.utils.services.buildVolume;

  /*
   * Supported versions for pma
   */
  const versions = [
    '4.7',
    '4.6',
    'latest',
    'custom',
  ];

  /*
   * Return the networks needed
   */
  const networks = () => ({});

  /*
   * Build out mysql
   */
  const services = (name, config) => {
    // Start a services collector
    const services = {};

    // Get the hosts
    let hosts = _.get(config, 'hosts', 'database');

    // Arrayify the hosts if needed
    if (!_.isArray(hosts)) {
      hosts = [hosts];
    }

    // Default pma service
    const pma = {
      image: 'phpmyadmin/phpmyadmin:' + config.version,
      environment: {
        MYSQL_ROOT_PASSWORD: '',
        PMA_HOSTS: hosts.join(','),
        PMA_PORT: 3306,
        PMA_USER: 'root',
        PMA_PASSWORD: '',
        TERM: 'xterm',
      },
      ports: ['80'],
      command: '/run.sh phpmyadmin',
    };

    // Handle custom config file
    if (_.has(config, 'config')) {
      const local = config.config;
      const remote = '/etc/phpmyadmin/config.user.inc.php';
      const customConfig = buildVolume(local, remote, '$LANDO_APP_ROOT_BIND');
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
  const volumes = () => ({});

  /*
   * Metadata about our service
   */
  const info = () => ({});

  return {
    defaultVersion: '4.7',
    info: info,
    networks: networks,
    services: services,
    versions: versions,
    volumes: volumes,
    configDir: __dirname,
  };
};
