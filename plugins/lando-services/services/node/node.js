'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;

  /*
   * Supported versions for node
   */
  var versions = [
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
    'custom'
  ];

  /*
   * Return the networks needed
   */
  var networks = function() {
    return {};
  };

  /*
   * Build out node
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
      '/bin'
    ];

    // Volumes
    var vols = [
      '/usr/local/bin',
      '/usr/local/share',
      '/usr/local/lib/node_modules'
    ];

    // Basic config
    var cliCmd = 'tail -f /dev/null';
    var version = config.version || '6';
    var command = config.command || cliCmd;

    // Arrayify the command if needed
    if (!_.isArray(command)) {
      command = [command];
    }

    // Start with the node base
    var node = {
      image: 'node:' + version,
      environment: {
        TERM: 'xterm',
        PATH: path.join(':')
      },
      'working_dir': config._mount,
      ports: ['80'],
      expose: ['80'],
      volumes: vols,
      command: '/bin/sh -c "' + command.join(' && ') + '"'
    };

    // If we have not specified a command we should assume this service was intended
    // to be run for CLI purposes
    if (!_.has(config, 'command')) {
      node.ports = [];
    }

    // And if not we need to add in an additional cli container so that we can
    // run things like lando npm install before our app starts up
    else {

      // Spoof the config and add some internal properties
      var cliConf = {
        type: 'node:' + version,
        _app: config._app,
        _root: config._root,
        _mount: config._mount
      };

      // Extract the cli service and add here
      var cliCompose = lando.services.build('cli', 'node:' + version, cliConf);
      var cliName = name + '_cli';
      services[cliName] = cliCompose.services.cli;

      // Add a flag so we know this is built behind the the scenes
      config._hiddenServices = [cliName];

    }

    // Generate some certs we can use
    if (config.ssl) {
      node.ports.push('443');
    }

    // Add our npm things to run step
    if (!_.isEmpty(config.globals)) {
      _.forEach(config.globals, function(version, pkg) {

        // Ensure globals is arrayed
        config.run_internal = config.run_internal || [];

        // Queue up our global composer command
        var nig = ['npm', 'install', '-g'];

        // Get the dep
        var dep = [pkg];

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
  var info = function() {
    return {};
  };

  /*
   * Return the volumes needed
   */
  var volumes = function() {

    // Construct our volumes
    var volumes = {
      data: {}
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
    configDir: __dirname
  };

};
