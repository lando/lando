'use strict';

module.exports = lando => {
  // Modules
  const _ = lando.node._;
  const addConfig = lando.utils.services.addConfig;
  const addScript = lando.utils.services.addScript;
  const buildVolume = lando.utils.services.buildVolume;

  // "Constants"
  const scd = lando.config.servicesConfigDir;
  const esd = lando.config.engineScriptsDir;

  /*
   * Supported versions for apache
   */
  const versions = [
    '2.4',
    '2.2',
    'latest',
    'custom',
  ];

  /*
   * Return the networks needed
   */
  const networks = () => ({});

  /*
   * Build out apache
   */
  const services = (name, config) => {
    // Start a services collector
    const services = {};

    // Define config mappings
    const configFiles = {
      server: '/usr/local/apache2/conf/httpd.conf',
      webroot: config._mount,
    };

    // Add the webroot if its there
    if (_.has(config, 'webroot')) {
      configFiles.webroot = configFiles.webroot + '/' + config.webroot;
    }

    // Default apache service
    const apache = {
      image: 'httpd:' + config.version,
      ports: ['80'],
      environment: {
        TERM: 'xterm',
        LANDO_WEBROOT: configFiles.webroot,
      },
      volumes: [],
      command: 'httpd-foreground',
    };

    // Set the default HTTPD conf file
    const httpConf = ['apache', 'httpd.conf'];
    const confVol = buildVolume(httpConf, configFiles.server, scd);
    apache.volumes = addConfig(confVol, apache.volumes);

    // Handle ssl option
    if (config.ssl) {
      // Add the SSL port
      apache.ports.push('443');

      // Inject add-cert so we can get certs before our app starts
      apache.volumes = addScript('add-cert.sh', apache.volumes, esd, 'scripts');

      // If we don't have a custom default ssl config lets use the default one
      const sslConf = ['apache', 'httpd-ssl.conf'];
      const sslVolume = buildVolume(sslConf, configFiles.server, scd);
      apache.volumes = addConfig(sslVolume, apache.volumes);

      // Add a healthcheck so we wait until open-ssl gets installed
      apache.healthcheck = {
        test: 'dpkg -s openssl',
        interval: '2s',
        timeout: '10s',
        retries: 25,
      };
    }

    // Handle custom config files
    _.forEach(configFiles, (file, type) => {
      if (_.has(config, 'config.' + type)) {
        const local = config.config[type];
        const customConfig = buildVolume(local, file, '$LANDO_APP_ROOT_BIND');
        apache.volumes = addConfig(customConfig, apache.volumes);
      }
    });

    // Put it all together
    services[name] = apache;

    // Return our service
    return services;
  };

  /*
   * Metadata about our service
   */
  const info = (name, config) => {
    // Start up an info collector
    const info = {};

    // Add the webroot
    info.webroot = _.get(config, 'webroot', '.');

    // Show the config files being used if they are custom
    if (!_.isEmpty(config.config)) {
      info.config = config.config;
    }

    // Return the collected info
    return info;
  };

  /*
   * Return the volumes needed
   */
  const volumes = function() {
    return {data: {}};
  };

  return {
    defaultVersion: '2.4',
    info: info,
    networks: networks,
    services: services,
    versions: versions,
    volumes: volumes,
    configDir: __dirname,
  };
};
