'use strict';

module.exports = lando => {
  // Modules
  const _ = lando.node._;

  /*
   * Supported versions for python
   */
  const versions = [
    '3',
    '3.6',
    '3.5',
    '3.4',
    '3.3',
    '2',
    '2.7',
    'latest',
    'custom',
  ];

  /*
   * Return the networks needed
   */
  const networks = () => ({});

  /*
   * Build out python
   */
  const services = (name, config) => {
    // Start a services collector
    const services = {};

    // pip install path
    const pythonUserBase = '/var/www/.local';

    // Path
    // @todo: need to add global gem locaation?
    const path = [
      pythonUserBase + '/bin',
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
      'python_share:/var/www/.cache/pip',
      'python_share:' + pythonUserBase,
    ];

    // Basic config
    const cliCmd = 'tail -f /dev/null';
    const version = config.version || '2';
    let command = config.command || cliCmd;

    // Arrayify the command if needed
    if (!_.isArray(command)) command = [command];

    // Start with the python base
    const python = {
      image: 'python:' + version + '-jessie',
      environment: {
        TERM: 'xterm',
        PATH: path.join(':'),
        PIP_USER: 'true',
        PYTHONUSERBASE: pythonUserBase,
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
      python.ports = [];
    }

    // Generate some certs we can use
    if (config.ssl) {
      python.ports.push('443');
    }

    // Put it all together
    services[name] = python;

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
  const volumes = () => ({'python_share': {}});

  return {
    defaultVersion: '3.6',
    info: info,
    networks: networks,
    services: services,
    versions: versions,
    volumes: volumes,
    configDir: __dirname,
  };
};
