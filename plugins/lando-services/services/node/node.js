'use strict';

module.exports = lando => {
  // Modules
  const _ = lando.node._;

  /*
   * Supported versions for node
   */
  const versions = [
    '10',
    '9',
    '8',
    'carbon',
    '8.0',
    '8.4',
    '8.9',
    '6',
    'boron',
    '6.10',
    '6.11',
    '6.12',
    '4',
    'argon',
    '4.8',
    'latest',
    'custom',
  ];

  /*
   * Return the networks needed
   */
  const networks = () => ({});

  /*
   * Build out node
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
      '/usr/local/lib/node_modules',
    ];

    // Basic config
    const cliCmd = 'tail -f /dev/null';
    const version = config.version || '6';
    let command = config.command || cliCmd;

    // Arrayify the command if needed
    if (!_.isArray(command)) {
      command = [command];
    }

    // Start with the node base
    const node = {
      image: 'node:' + version,
      environment: {
        TERM: 'xterm',
        PATH: path.join(':'),
      },
      working_dir: config._mount,
      ports: ['80'],
      volumes: vols,
      command: '/bin/sh -c "' + command.join(' && ') + '"',
    };

    // If we have not specified a command we should assume this service was intended
    // to be run for CLI purposes
    if (!_.has(config, 'command')) {
      node.ports = [];
    }

    // Generate some certs we can use
    if (config.ssl) {
      node.ports.push('443');
    }

    // Add our npm things to run step
    if (!_.isEmpty(config.globals)) {
      _.forEach(config.globals, (version, pkg) => {
        // Ensure globals is arrayed
        config.run_internal = config.run_internal || [];

        // Queue up our global composer command
        const nig = ['npm', 'install', '-g'];

        // Get the dep
        const dep = [pkg];

        // Add a version if we have one
        if (!_.isEmpty(version)) {
          dep.push(version);
        }

        // Build the command
        nig.push(dep.join('@'));

        // Add before our other builds
        config.run_internal.unshift(nig.join(' '));
      });
    }

    // Put it all together
    services[name] = node;

    // Return our service
    return services;
  };

  /*
   * Metadata about our service
   */
  const info = () => ({});

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
    defaultVersion: '8.9',
    info: info,
    networks: networks,
    services: services,
    versions: versions,
    volumes: volumes,
    configDir: __dirname,
  };
};
