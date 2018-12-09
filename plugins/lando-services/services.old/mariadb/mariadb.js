'use strict';

module.exports = lando => {
  // Modules
  const _ = lando.node._;
  const addConfig = lando.utils.services.addConfig;
  const buildVolume = lando.utils.services.buildVolume;

  /*
   * Supported versions for mariadb
   */
  const versions = [
    '10.3',
    '10.2',
    '10.1',
    '10.0',
    '5.5',
    'latest',
    'custom',
  ];

  /*
   * Return the networks needed
   */
  const networks = () => ({});

  /*
   * Build out mariadb
   */
  const services = (name, config) => {
    // Start a services collector
    const services = {};

    // Define config mappings
    const configFiles = {
      confd: '/etc/mysql/conf.d',
      dataDir: '/var/lib/mysql',
    };

    // GEt creds
    const creds = config.creds || {};

    // Default mariadb service
    const mariadb = {
      image: 'mariadb:' + config.version,
      environment: {
        MYSQL_USER: creds.user || 'mariadb',
        MYSQL_PASSWORD: creds.password || 'password',
        MYSQL_ALLOW_EMPTY_PASSWORD: 'yes',
        MYSQL_DATABASE: creds.database || 'database',
        TERM: 'xterm',
      },
      volumes: ['data_' + name + ':' + configFiles.dataDir],
      healthcheck: {
        test: 'mysql -uroot --silent --execute "SHOW DATABASES;"',
        interval: '2s',
        timeout: '10s',
        retries: 25,
      },
      command: 'docker-entrypoint.sh mysqld',
    };

    // Handle port forwarding
    if (config.portforward) {
      // If true assign a port automatically
      if (config.portforward === true) {
        mariadb.ports = ['3306'];
      } else {
        mariadb.ports = [config.portforward + ':3306'];
      }
    }

    // Handle custom config directory
    _.forEach(configFiles, (file, type) => {
      if (_.has(config, 'config.' + type)) {
        const local = config.config[type];
        const customConfig = buildVolume(local, file, '$LANDO_APP_ROOT_BIND');
        mariadb.volumes = addConfig(customConfig, mariadb.volumes);
      }
    });

    // Put it all together
    services[name] = mariadb;

    // Return our service
    return services;
  };

  /*
   * Return the volumes needed
   */
  const volumes = name => {
    const vols = {};
    vols['data_' + name] = {};
    return vols;
  };

  /*
   * Metadata about our service
   */
  const info = (name, config) => {
    // Add in generic info
    const info = {
      creds: {
        user: config.environment.MYSQL_USER,
        password: config.environment.MYSQL_PASSWORD,
        database: config.environment.MYSQL_DATABASE,
      },
      internal_connection: {
        host: name,
        port: config.port || 3306,
      },
      external_connection: {
        host: 'localhost',
        port: config.portforward || 'not forwarded',
      },
    };

    // Show the config files being used if they are custom
    if (!_.isEmpty(config.config)) {
      info.config = config.config;
    }

    // Return the collected info
    return info;
  };

  return {
    defaultVersion: '10.3',
    info: info,
    networks: networks,
    services: services,
    versions: versions,
    volumes: volumes,
    configDir: __dirname,
  };
};
