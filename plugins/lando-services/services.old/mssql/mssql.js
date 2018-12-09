'use strict';

module.exports = () => {
  /*
   * Supported versions for mssql
   */
  const versions = [
    'latest',
    'custom',
  ];

  /*
   * Return the networks needed
   */
  const networks = () => ({});

  /*
   * Build out mssql
   */
  const services = (name, config) => {
    // Start a services collector
    const services = {};

    // Path
    const path = [
      '/usr/local/sbin',
      '/usr/local/bin',
      '/usr/sbin',
      '/usr/bin',
      '/sbin',
      '/bin',
      '/opt/mssql-tools/bin',
    ];

    // GEt creds
    const password = config.password || 'he11oTHERE';

    // Default mssql service
    const mssql = {
      image: 'microsoft/mssql-server-linux',
      environment: {
        ACCEPT_EULA: 'Y',
        PATH: path.join(':'),
        SA_PASSWORD: password,
        TERM: 'xterm',
      },
      command: '/opt/mssql/bin/sqlservr',
    };

    // Handle port forwarding
    if (config.portforward) {
      // If true assign a port automatically
      if (config.portforward === true) {
        mssql.ports = ['1443'];
      } else {
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
  const volumes = () => {
    return {data: {}};
  };

  /*
   * Metadata about our service
   */
  const info = (name, config) => {
    // Add in generic info
    const info = {
      creds: {
        user: 'sa',
        password: config.environment.SA_PASSWORD,
      },
      internal_connection: {
        host: name,
        port: config.port || 1443,
      },
      external_connection: {
        host: 'localhost',
        port: config.portforward || 'not forwarded',
      },
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
    configDir: __dirname,
  };
};
