/**
 * Lando php service builder
 *
 * @name php
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = require('lodash');
  var addConfig = lando.services.addConfig;
  var addScript = lando.services.addScript;
  var buildVolume = lando.services.buildVolume;

  // "Constants"
  var defaultConfDir = lando.config.engineConfigDir;

  /**
   * Supported versions for php
   */
  var versions = [
    '7.1',
    '7.0',
    '5.6',
    '5.5',
    '5.4',
    '5.3',
    'hhvm',
    'latest',
    'custom'
  ];

  /**
   * Return the networks needed
   */
  var networks = function() {
    return {};
  };

  /*
   * Parse our config
   */
  var parseConfig = function(config) {

    // Get the version and type
    var version = config.version || '7.0';
    var via = _.has(config, 'via') ? config.via.split(':')[0] : 'cli';

    // Define type specific config things
    var typeConfig = {
      apache: {
        web: 'apache',
        mount: config._mount,
        command: [
          'sh -c',
          '\'a2enmod rewrite && apache2-foreground\''
        ],
        image: 'devwithlando/php:' + [version, 'apache'].join('-'),
        serverConf: '/etc/apache2/sites-enabled/000-default.conf',
        phpConf: '/usr/local/etc/php/conf.d/zzz-lando-custom.ini'
      },
      cli: {
        web: 'cli',
        mount: config._mount,
        command: ['tail -f /dev/null'],
        image: 'devwithlando/php:' + [version, 'apache'].join('-'),
        serverConf: '/etc/nginx/conf.d/default.template',
        phpConf: '/usr/local/etc/php/conf.d/zzz-lando-custom.ini'
      },
      nginx: {
        web: 'nginx',
        mount: config._mount,
        command: ['php-fpm'],
        image: 'devwithlando/php:' + [version, 'fpm'].join('-'),
        serverConf: '/etc/nginx/conf.d/default.template',
        phpConf: '/usr/local/etc/php/conf.d/zzz-lando-custom.ini'
      }
    };

    // Add the docker php entrypoint if we are on a supported php version
    if (version.split('.').join('') > 55) {
      typeConfig[via].command.unshift('docker-php-entrypoint');
    }

    // Switch apache php.ini if on 5.3
    if (via === 'apache' && version === '5.3') {
      typeConfig.apache.phpConf = '/usr/local/lib/conf.d/zzz-lando-custom.ini';
    }

    // If hhvm is the "version" then refactor the typeconf
    // @TODO: if people are into the HHVM we will want to make this more robust
    // eg have actual hhvm version and via support for apache/nginx/etc
    if (version === 'hhvm') {
      via = 'nginx';
      typeConfig.nginx.image = 'baptistedonaux/hhvm';
      typeConfig.nginx.phpConf = '/etc/hhvm/php.ini';
      typeConfig.nginx.command = [
        'hhvm',
        '-m server',
        '-vServer.Type=fastcgi',
        '-vServer.Port=9000',
        '-vServer.AllowRunAsRoot=1'
      ];
    }

    // Return type specific config
    return _.merge(config, typeConfig[via]);

  };

  /*
   * Build php
   */
  var php = function(config) {

    // Path
    var path = [
      '/usr/local/sbin',
      '/usr/local/bin',
      '/usr/sbin',
      '/usr/bin',
      '/sbin',
      '/bin',
      '/var/www/.composer/vendor/bin'
    ];

    // Build the webroot
    var webroot = config._mount;

    // Add the webroot if its there
    if (_.has(config, 'webroot')) {
      webroot = webroot + '/' + config.webroot;
    }

    // Start with the php base
    var php = {
      image: config.image,
      environment: {
        TERM: 'xterm',
        COMPOSER_ALLOW_SUPERUSER: 1,
        PATH: path.join(':'),
        LANDO_WEBROOT: webroot
      },
      ports: ['80'],
      volumes: [
        '/var/www/.composer',
        '/usr/local/bin'
      ],
      command: config.command.join(' '),
    };

    // Add our default php ini
    var phpIniFile = ['php', 'php.ini'];
    var iniMount = buildVolume(phpIniFile, config.phpConf, defaultConfDir);
    php.volumes = addConfig(iniMount, php.volumes);

    // Add in our xdebug config
    if (config.xdebug) {

      // Conf
      var xconfig = [
        'remote_enable=true',
        'remote_host=' + lando.config.env.LANDO_ENGINE_REMOTE_IP
      ];

      // Add the conf
      php.environment.XDEBUG_CONFIG = xconfig.join(' ');

    }

    // If this is apache lets set our default config
    if (config.web === 'apache') {

      // Set the default conf file
      var defaultConfFile = 'httpd.conf';

      // Add ssl specific things if we need them
      if (config.ssl) {

        // Set the correct port
        php.ports.push('443');

        // Add in the add cert script
        php.volumes = addScript('add-cert.sh', php.volumes);

        // Change the default conf file
        defaultConfFile = 'httpd-ssl.conf';

      }

      // If php version 5.3 we need to set the logs dir
      if (config.version === '5.3') {
        php.environment.APACHE_LOG_DIR = '/var/log';
      }

      // Handle our apache config
      var configFile = ['php', defaultConfFile];
      var mount = buildVolume(configFile, config.serverConf, defaultConfDir);
      php.volumes = addConfig(mount, php.volumes);

    }

    // If this being delivered via nginx we need to modify some things
    if (config.web === 'nginx') {

      // Make sure network alias exists
      php.networks = {default: {aliases: ['fpm']}};

      // Set ports to empty
      php.ports = [];

    }

    // Unset our ports if this is a CLI service
    if (config.web === 'cli') {
      php.ports = [];
    }

    // REturn the service
    return php;

  };

  /*
   * Build nginx
   */
  var nginx = function(config) {

    // Add a version to the type if applicable
    var type = ['nginx', config.via.split(':')[1]].join(':');

    // Handle our nginx config
    var defaultConfFile = (config.ssl) ? 'default-ssl.conf' : 'default.conf';
    var configFile = ['php', defaultConfFile];
    var mount = buildVolume(configFile, config.serverConf, defaultConfDir);
    var nginxConfigDefaults = {
      server: _.dropRight(mount.split(':')).join(':')
    };

    // Clone the config so we can separate concerns
    // This is mostly done so we can remove undesireable overrides like
    // resetting the service image
    var appConfig = _.cloneDeep(config);

    // Don't allow us to override the image here
    if (_.has(appConfig, 'overrides.services.image')) {
      delete appConfig.overrides.services.image;
    }

    // Set the nginx config
    appConfig.config = _.merge(nginxConfigDefaults, appConfig.config);

    // Generate a config object to build the service with
    var name = appConfig.name;
    var nginx = lando.services.build(name, type, appConfig).services[name];

    // Add a depends on
    _.set(nginx, 'depends_on', [name]);

    // Return the object
    return nginx;

  };

  /*
   * Build a starting point for our service
   * lets delegate this since php is complicated
   */
  var buildAppserver = function(config) {

    // Start a services collector
    var services = {};

    // Build the correct "appserver"
    services[config.name] = php(config);

    // Add nginx delivery if we are doing nginx
    if (config.web === 'nginx') {
      services.nginx = nginx(config);
    }

    // Return things
    return services;

  };

  /**
   * Build out php
   */
  var services = function(name, config) {

    // Parse our config
    config.name = name;
    config = parseConfig(config);

    // Get basic services things
    var services = buildAppserver(config);

    // Define config mappings
    var configFiles = {
      php: {
        conf: config.phpConf
      },
      web: {
        server: config.serverConf
      }
    };

    // Handle custom web config files/dirs
    var web = (config.web === 'nginx') ? 'nginx' : name;
    _.forEach(configFiles.web, function(file, type) {
      if (_.has(config, 'config.' + type)) {
        var local = config.config[type];
        var customConf = buildVolume(local, file, '$LANDO_APP_ROOT_BIND');
        services[web].volumes = addConfig(customConf, services[web].volumes);
      }
    });

    // Handle custom php config files/dirs
    _.forEach(configFiles.php, function(file, type) {
      if (_.has(config, 'config.' + type)) {
        var local = config.config[type];
        var customConf = buildVolume(local, file, '$LANDO_APP_ROOT_BIND');
        var volumes = services[name].volumes;
        services[name].volumes = addConfig(customConf, volumes);
      }
    });

    // Add our composer things to build extra
    if (!_.isEmpty(config.composer)) {
      _.forEach(config.composer, function(version, pkg) {

        // Ensure build is arrayed
        config.build = config.build || [];

        // Queue up our global composer command
        var cgr = ['composer', 'global', 'require'];

        // Get the dep
        var dep = [pkg];

        // Add a version if we have one
        if (!_.isEmpty(version)) {
          dep.push(version);
        }

        // Build the command
        cgr.push(dep.join(':'));

        // Unshift in our composer deps
        config.build.unshift(cgr.join(' '));

      });
    }

    // Return our service
    return services;

  };

  /**
   * Metadata about our service
   */
  var info = function(name, config) {

    // Start up an info collector
    var info = {};

    // Add in appserver basics
    info.via = config.via;
    info.webroot = _.get(config, 'webroot', '.');

    // Show the config files being used if they are custom
    if (!_.isEmpty(config.config)) {
      info.config  = config.config;
    }

    // Return the collected info
    return info;

  };

  /**
   * Return the volumes needed
   */
  var volumes = function(name) {

    // Construct our volumes
    var volumes = {
      data: {}
    };

    // Add the appserver
    volumes[name] = {};

    // Return the volumes
    return volumes;

  };

  return {
    info: info,
    networks: networks,
    services: services,
    versions: versions,
    volumes: volumes,
    configDir: __dirname
  };

};
