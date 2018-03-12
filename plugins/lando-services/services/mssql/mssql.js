'use strict';

module.exports = function() {

  /*
   * Supported versions for mssql
   */
  var versions = [
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
   * Build out mssql
   */
  var services = function(name, config) {

    // Start a services collector
    var services = {};

    // Path
    var path = [
      '/usr/local/sbin',
      '/usr/local/bin',
      '/usr/sbin',
      '/usr/bin',
      '/sbin',
      '/bin',
      '/opt/mssql-tools/bin'
    ];

    // GEt creds
    var password = config.password || 'he11oTHERE';

    // Default mssql service
    var mssql = {
      image: 'microsoft/mssql-server-linux',
      environment: {
        ACCEPT_EULA: 'Y',
        PATH: path.join(':'),
        SA_PASSWORD: password,
        TERM: 'xterm'
      },
      command: '/opt/mssql/bin/sqlservr'
    };

    // Handle port forwarding
    if (config.portforward) {

      // If true assign a port automatically
      if (config.portforward === true) {
        mssql.ports = ['1443'];
      }

      // Else use the specified port
      else {
        mssql.ports = [config.portforward + ':1443'];
      }

    }

    // Put it all together
    services[name] = mssql;

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

    // Add in generic info
    var info = {
      creds: {
        user: 'sa',
        password: config.environment.SA_PASSWORD
      },
      'internal_connection': {
        host: name,
        port: config.port || 1443
      },
      'external_connection': {
        host: 'localhost',
        port: config.portforward || 'not forwarded'
      }
    };

    // Return the collected info
    return info;

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
