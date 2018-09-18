'use strict';

module.exports = lando => {
  // Modules
  const _ = lando.node._;
  const addConfig = lando.utils.services.addConfig;
  const buildVolume = lando.utils.services.buildVolume;
  const path = require('path');

  // "Constants"
  const scd = lando.config.servicesConfigDir;

  /*
   * Supported versions for varnish
   */
  const versions = [
    '4.1',
    'latest',
    'custom',
  ];

  /*
   * Return the networks needed
   */
  const networks = () => ({});

  /*
   * Build an nginx ssl-termination endpoint
   */
  const nginx = config => {
    // Get the name
    const name = config.name;

    // Handle our nginx config
    const defaultConfFile = 'ssl-termination.conf';
    const configFile = ['varnish', defaultConfFile];
    const remote = '/etc/nginx/conf.d/default.template';
    const mount = buildVolume(configFile, remote, scd);
    const nginxConf = {
      server: _.dropRight(mount.split(':')).join(':'),
    };

    // Generate a config object to build the service with
    config = _.merge(config, {
      type: 'nginx',
      ssl: true,
      skipCheck: config.skipCheck || false,
      config: nginxConf,
    });

    // Get the nginx services
    const nginx = lando.services.build(name, 'nginx', config).services[name];

    // Set to only expose port 443
    nginx.ports = ['443'];
    nginx.expose = ['443'];

    // Depends on varnish being up
    _.set(nginx, 'depends_on', [config.depends]);

    // Return the object
    return nginx;
  };

  /*
   * Build out varnish
   */
  const services = (name, config) => {
    // Start a services collector
    const services = {};

    // Early config version differences
    const versionConfig = {
      '4.1': {
        image: 'eeacms/varnish:4.1-3.0',
      },
      'latest': {
        image: 'eeacms/varnish:4.1-3.0',
      },
    };

    // Get our backends
    const backends = config.backends || ['appserver'];

    // Arrayify the command if needed
    if (!_.isArray(backends)) backends = [backends];

    // Build cmd
    // Ee want to turn off host and dns tracking to make this more reliable
    const chap = '/etc/chaperone.d/chaperone.conf';
    const cmd = [
      '/bin/sh -c',
      '"sed -i \\\"/  enabled: /c\  enabled: false,\\\" ' + chap,
      '&&',
      '/usr/local/bin/chaperone --user root --force --debug"',
    ].join(' ');

    // Default varnish service
    const varnish = {
      image: versionConfig[config.version].image,
      ports: ['80'],
      environment: {
        TERM: 'xterm',
        BACKENDS: backends.join(' '),
        ADDRESS_PORT: ':80',
        BACKENDS_PROBE_ENABLED: 'false',
      },
      depends_on: backends,
      command: cmd,
    };

    // Handle custom vcl file
    if (_.has(config, 'vcl')) {
      const local = config.vcl;
      const remote = '/etc/varnish/conf.d/' + path.basename(local);
      const customConfig = buildVolume(local, remote, '$LANDO_APP_ROOT_BIND');
      varnish.volumes = addConfig(customConfig, varnish.volumes);
    }

    // Spin up an additional nginx for SSL termination
    if (config.ssl) {
      // Make sure network alias exists
      varnish.networks = {default: {aliases: ['varnish']}};

      // Get the nginx ssl termination
      const sslConfig = _.cloneDeep(config);
      sslConfig.depends = name;
      sslConfig.name = [name, 'ssl'].join('_');
      services[sslConfig.name] = nginx(sslConfig);
    }

    // Put it all together
    services[name] = varnish;

    // Return our service
    return services;
  };

  /*
   * Return the volumes needed
   */
  const volumes = () => ({data: {}});

  /*
   * Metadata about our service
   */
  const info = (name, config) => {
    // Surfaces the VCL file if specified
    if (_.has(config, 'vcl')) info.vcl = config.vcl;
    // Specify the backends varnish is servicing
    info.backends = config.backends;
    // Return the collected info
    return info;
  };

  return {
    defaultVersion: '4.1',
    info: info,
    networks: networks,
    services: services,
    versions: versions,
    volumes: volumes,
    configDir: __dirname,
  };
};
