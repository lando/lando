'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var addConfig = lando.utils.services.addConfig;
  var buildVolume = lando.utils.services.buildVolume;

  /*
   * Supported versions for postgres
   */
  var versions = [
    '10.3',
    '10.2',
    '10.1',
    '9.6',
    '9.5',
    '9.4',
    '9.3',
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

    // Some basic things
    var ddd = '/var/lib/postgresql/data';
    var dataDir = _.get(config, 'overrides.services.environment.PGDATA', ddd);
    var defaultConfFile = '/usr/share/postgresql/postgresql.conf.sample';
    var customConfDir = '/etc/postgresql';
    var customPostgresFile = customConfDir + '/zzz-lando-custom-conf.conf';

    // Define config mappings
    var configFiles = {
      postgres: customPostgresFile,
      confd: customConfDir,
      dataDir: dataDir,
    };

    // GEt creds
    var creds = config.creds || {};

    // Default postgres service
    var postgres = {
      image: 'postgres:' + config.version,
      environment: {
        PGDATA: configFiles.dataDir,
        POSTGRES_USER: creds.user || 'postgres',
        POSTGRES_PASSWORD: creds.password || 'password',
        PGPASSWORD: creds.password || 'password',
        POSTGRES_DB: creds.database || 'database',
        TERM: 'xterm'
      },
      healthcheck: {
        test: 'psql -U postgres -c "\\\l"',
        interval: '2s',
        timeout: '10s',
        retries: 25
      },
      volumes: ['data_' + name + ':' + configFiles.dataDir],
      command: [
        '/bin/bash -c "',
        'sed -i "s/#include_dir/include_dir/g" ' + defaultConfFile,
        '&&',
        'sed -i \'s|conf.d|' + configFiles.confd + '|g\' ' + defaultConfFile,
        '&&',
        'docker-entrypoint.sh postgres',
        '"'
      ].join(' ')
    };

    // Handle port forwarding
    if (config.portforward) {

      // If true assign a port automatically
      if (config.portforward === true) {
        postgres.ports = ['5432'];
      }

      // Else use the specified port
      else {
        postgres.ports = [config.portforward + ':5432'];
      }

    }

    // Handle custom config directory
    _.forEach(configFiles, function(file, type) {
      if (_.has(config, 'config.' + type)) {
        var local = config.config[type];
        var customConfig = buildVolume(local, file, '$LANDO_APP_ROOT_BIND');
        postgres.volumes = addConfig(customConfig, postgres.volumes);
      }
    });

    // Put it all together
    services[name] = postgres;

    // Return our service
    return services;

  };

  /*
   * Return the volumes needed
   */
  var volumes = function(name) {
    var vols = {};
    vols['data_' + name] = {};
    return vols;
  };

  /*
   * Metadata about our service
   */
  var info = function(name, config) {

    // Add in generic info
    var info = {
      creds: {
        user: config.environment.POSTGRES_USER,
        password: config.environment.POSTGRES_PASSWORD,
        database: config.environment.POSTGRES_DB
      },
      'internal_connection': {
        host: name,
        port: config.port || 5432
      },
      'external_connection': {
        host: 'localhost',
        port: config.portforward || 'not forwarded'
      }
    };

    // Show the config files being used if they are custom
    if (!_.isEmpty(config.config)) {
      info.config  = config.config;
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
    configDir: __dirname
  };

};
