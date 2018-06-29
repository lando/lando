'use strict';

module.exports = lando => {
  // Modules
  const _ = lando.node._;

  /*
   * Supported versions for go
   */
  const versions = [
    '1.8.4',
    '1.8',
    'latest',
    'custom',
  ];

  /*
   * Return the networks needed
   */
  const networks = () => ({});

  /*
   * Build out go
   */
  const services = (name, config) => {
    // Start a services collector
    const services = {};

    // Volumes
    const vols = [
      '/usr/local/bin',
      '/usr/local/share',
    ];

    // Basic config
    const cliCmd = 'tail -f /dev/null';
    const version = config.version || '1';
    const command = config.command || cliCmd;

    // Arrayify the command if needed
    if (!_.isArray(command)) {
      command = [command];
    }

    // Start with the node base
    const go = {
      image: 'golang:' + version + '-jessie',
      environment: {
        TERM: 'xterm',
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
      go.ports = [];
    }

    // Generate some certs we can use
    if (config.ssl) {
      go.ports.push('443');
    }

    // Put it all together
    services[name] = go;

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
  const volumes = function() {
    // Construct our volumes
    const volumes = {
      data: {},
    };
    // Return the volumes
    return volumes;
  };

  return {
    defaultVersion: '1.8',
    info: info,
    networks: networks,
    services: services,
    versions: versions,
    volumes: volumes,
    configDir: __dirname,
  };
};
