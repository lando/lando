'use strict';

module.exports = lando => {
  // Modules
  const _ = lando.node._;

  /*
   * Supported versions for dotnet
   */
  const versions = [
    '2',
    '2.0',
    '1',
    '1.1',
    '1.0',
    'latest',
    'custom',
  ];

  /*
   * Return the networks needed
   */
  const networks = () => ({});

  /*
   * Build out dotnet
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
    ];

    // Volumes
    const vols = [
      '/usr/local/bin',
      '/usr/local/share',
      '/usr/local/bundle',
      '/var/www/.asp',
    ];

    // Basic config
    const cliCmd = 'tail -f /dev/null';
    const version = config.version || '2';
    let command = config.command || cliCmd;

    // Arrayify the command if needed
    if (!_.isArray(command)) {
      command = [command];
    }

    // Start with the python base
    const dotnet = {
      image: 'microsoft/dotnet:' + version + '-sdk-jessie',
      environment: {
        TERM: 'xterm',
        PATH: path.join(':'),
        ASPNETCORE_URLS: 'http://+:80',
      },
      working_dir: config._mount,
      ports: ['80'],
      expose: ['80'],
      volumes: vols,
      command: '/bin/sh -c "' + command.join(' && ') + '"',
    };

    // If we have not specified a command we should assume this service was intended
    // to be run for CLI purposes
    if (!_.has(config, 'command')) {
      dotnet.ports = [];
    }

    // Generate some certs we can use
    if (config.ssl) {
      dotnet.ports.push('443');
    }

    // Put it all together
    services[name] = dotnet;

    // Return our service
    return services;
  };

  /*
   * Metadata about our service
   */
  const info = () => {
    return {};
  };

  /*
   * Return the volumes needed
   */
  const volumes = () => {
    // Construct our volumes
    const volumes = {
      data: {},
    };
    // Return the volumes
    return volumes;
  };

  return {
    defaultVersion: '2.0',
    info: info,
    networks: networks,
    services: services,
    versions: versions,
    volumes: volumes,
    configDir: __dirname,
  };
};
