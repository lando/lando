'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var addConfig = lando.utils.services.addConfig;
  var buildVolume = lando.utils.services.buildVolume;
  var path = require('path');

  // "Constants"
  var scd = lando.config.servicesConfigDir;

  /*
   * Supported versions for varnish
   */
  var versions = [
    '4.1',
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
   * Build an nginx ssl-termination endpoint
   */
  var nginx = function(config) {

    // Get the name
    var name = config.name;

    // Handle our nginx config
    var defaultConfFile = 'ssl-termination.conf';
    var configFile = ['varnish', defaultConfFile];
    var remote = '/etc/nginx/conf.d/default.template';
    var mount = buildVolume(configFile, remote, scd);
    var nginxConf = {
      server: _.dropRight(mount.split(':')).join(':')
    };

    // Generate a config object to build the service with
    config = _.merge(config, {
      type: 'nginx',
      ssl: true,
      config: nginxConf
    });

    // Get the nginx services
    var nginx = lando.services.build(name, 'nginx', config).services[name];

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
  var services = function(name, config) {

    // Start a services collector
    var services = {};

    // Early config version differences
    var versionConfig = {
      '4.1': {
        image: 'eeacms/varnish:4.1-3.0'
      },
      'latest': {
        image: 'eeacms/varnish:4.1-3.0'
      }
    };

    // Get our backends
    var backends = config.backends || ['appserver'];

    // Arrayify the command if needed
    if (!_.isArray(backends)) {
      backends = [backends];
    }

    // Build cmd
    // Ee want to turn off host and dns tracking to make this more reliable
    var chap = '/etc/chaperone.d/chaperone.conf';
    var cmd = [
      '/bin/sh -c',
      '"sed -i \\\"/  enabled: /c\  enabled: false,\\\" ' + chap,
      '&&',
      '/usr/local/bin/chaperone --user root --force --debug"',
    ].join(' ');

    // Default varnish service
    var varnish = {
      image: versionConfig[config.version].image,
      ports: ['80'],
      environment: {
        TERM: 'xterm',
        BACKENDS: backends.join(' '),
        ADDRESS_PORT: ':80',
        BACKENDS_PROBE_ENABLED: 'false'
      },
      'depends_on': backends,
      command: cmd
    };

    // Handle custom vcl file
    if (_.has(config, 'vcl')) {
      var local = config.vcl;
      var remote = '/etc/varnish/conf.d/' + path.basename(local);
      var customConfig = buildVolume(local, remote, '$LANDO_APP_ROOT_BIND');
      varnish.volumes = addConfig(customConfig, varnish.volumes);
    }

    // Spin up an additional nginx for SSL termination
    if (config.ssl) {

      // Make sure network alias exists
      varnish.networks = {default: {aliases: ['varnish']}};

      // Get the nginx ssl termination
      var sslConfig = _.cloneDeep(config);
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
  var volumes = function() {
    return {data: {}};
  };

  /*
   * Metadata about our service
   */
  var info = function(name, config) {

    // Surfaces the VCL file if specified
    if (_.has(config, 'vcl')) {
      info.vcl = config.vcl;
    }

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
    configDir: __dirname
  };

};
