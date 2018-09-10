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
   * Supported versions for nginx
   */
  const versions = [
    '1.13',
    '1.12',
    '1.11',
    '1.10',
    '1.9',
    '1.8',
    'mainline',
    'stable',
    'latest',
    'custom',
  ];

  /*
   * Return the networks needed
   */
  const networks = () => ({});

  /*
   * Build out nginx services
   */
  const services = (name, config) => {
    // Start a services collector
    const services = {};

    // Define config mappings
    const configFiles = {
      http: '/etc/nginx/nginx.conf',
      server: '/etc/nginx/conf.d/default.template',
      params: '/etc/nginx/fastcgi_params',
      webroot: config._mount,
    };

    // Add the webroot if its there
    if (_.has(config, 'webroot')) {
      configFiles.webroot = configFiles.webroot + '/' + config.webroot;
    }

    // Default nginx service
    const nginx = {
      image: 'nginx:' + config.version,
      ports: ['80'],
      environment: {
        TERM: 'xterm',
        LANDO_WEBROOT: configFiles.webroot,
      },
      volumes: [],
      command: [
        '/bin/sh -c',
        '"envsubst \'$$LANDO_WEBROOT\'',
        '</etc/nginx/conf.d/default.template > /etc/nginx/conf.d/default.conf',
        '&&',
        'nginx -g \'daemon off;\'"',
      ].join(' '),
    };

    // Set the default http conf file
    const httpConf = ['nginx', 'nginx.conf'];
    const httpVol = buildVolume(httpConf, configFiles.http, scd);
    nginx.volumes = addConfig(httpVol, nginx.volumes);

    // Set the default server conf file
    const serverConf = ['nginx', 'default.conf'];
    const serverVol = buildVolume(serverConf, configFiles.server, scd);
    nginx.volumes = addConfig(serverVol, nginx.volumes);

    // Set the default params conf file
    const paramConf = ['nginx', 'fastcgi_params'];
    const paramVol = buildVolume(paramConf, configFiles.params, scd);
    nginx.volumes = addConfig(paramVol, nginx.volumes);

    // Handle ssl option
    if (config.ssl) {
      // Add the SSL port
      nginx.ports.push('443');

      // Inject add-cert so we can get certs before our app starts
      nginx.volumes = addScript('add-cert.sh', nginx.volumes, esd, 'scripts');

      // If we don't have a custom default ssl config lets use the default one
      const sslConf = ['nginx', 'default-ssl.conf'];
      const sslVolume = buildVolume(sslConf, configFiles.server, scd);
      nginx.volumes = addConfig(sslVolume, nginx.volumes);

      // Add a healthcheck so we wait until open-ssl gets installed
      if (config.skipCheck !== true) {
        nginx.healthcheck = {
          test: 'dpkg -s openssl',
          interval: '2s',
          timeout: '10s',
          retries: 25,
        };
      }
    }

    // Handle custom config files
    _.forEach(configFiles, (file, type) => {
      if (_.has(config, 'config.' + type)) {
        const local = config.config[type];
        const customConfig = buildVolume(local, file, '$LANDO_APP_ROOT_BIND');
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
  const info = (name, config) => {
    // Start up an info collector
    const info = {};

    // Add in the webroot
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
    defaultVersion: '1.13',
    info: info,
    networks: networks,
    services: services,
    versions: versions,
    volumes: volumes,
    configDir: __dirname,
  };
};
