'use strict';

module.exports = lando => {
  // Modules
  const _ = lando.node._;
  const esd = lando.config.engineScriptsDir;
  const addScript = lando.utils.services.addScript;

  /*
   * Supported versions for ruby
   */
  const versions = [
    '2.4',
    '2.2',
    '2.1',
    '1.9',
    'latest',
    'custom',
  ];

  /*
   * Return the networks needed
   */
  const networks = () => ({});

  /*
   * Build out ruby
   */
  const services = (name, config) => {
    // Start a services collector
    const services = {};

    // Path
    // @todo: need to add global gem locaation?
    const path = [
      '/usr/local/sbin',
      '/usr/local/bin',
      '/usr/local/bundle/bin',
      '/usr/sbin',
      '/usr/bin',
      '/sbin',
      '/bin',
    ];

    // Volumes
    // Need to add gloval ruby gem location?
    const vols = [
      '/usr/local/bin',
      '/usr/local/share',
      '/usr/local/bundle',
    ];

    // Basic config
    const cliCmd = 'tail -f /dev/null';
    const version = config.version || '2';
    let command = config.command || cliCmd;

    // Arrayify the command if needed
    if (!_.isArray(command)) {
      command = [command];
    }

    // Start with the ruby base
    const ruby = {
      image: 'ruby:' + version,
      environment: {
        TERM: 'xterm',
        PATH: path.join(':'),
      },
      working_dir: config._mount,
      ports: ['80'],
      expose: ['80'],
      volumes: vols,
      command: '/bin/sh -c "' + command.join(' && ') + '"',
    };

    // If we have not specified a command we should assume this service was intended
    // to be run for CLI purposes
    if (!_.has(config, 'command')) ruby.ports = [];

    // Generate some certs we can use
    if (config.ssl) {
      ruby.ports.push('443');
      // Inject add-cert so we can get certs before our app starts
      ruby.volumes = addScript('add-cert.sh', ruby.volumes, esd, 'scripts');
    }

    // Put it all together
    services[name] = ruby;

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
  const volumes = () => {
    // Construct our volumes
    const volumes = {
      data: {},
    };
    // Return the volumes
    return volumes;
  };

  return {
    defaultVersion: '2.4',
    info: info,
    networks: networks,
    services: services,
    versions: versions,
    volumes: volumes,
    configDir: __dirname,
  };
};
