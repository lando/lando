/**
 * Lando node service builder
 *
 * @name node
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = require('lodash');
  var addScript = lando.services.addScript;

  /**
   * Supported versions for node
   */
  var versions = [
    '8.0',
    '6.10',
    '4.8',
    'latest',
    'custom'
  ];

  /**
   * Return the networks needed
   */
  var networks = function() {
    return {};
  };

  /**
   * Build out php
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

    // Build the basic config
    var version = config.version || '6.10';
    var command = config.command || ['tail', '-f', '/dev/null'];

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
      'working_dir': config.mount,
      ports: ['80'],
      expose: ['80'],
      volumes: [
        '/root'
      ],
      command: command.join(' '),
    };

    // Generate some certs we can use
    if (config.ssl) {

      // Add the ssl port
      node.ports.push('443');

      // Add in an add cert task
      node.volumes = addScript('add-cert.sh', node.volumes);

    }

    // If we have not specified a command we should assume this service was intended
    // to be run for CLI purposes
    if (!_.has(config, 'command')) {
      node.ports = [];
    }

    // Add our npm things to build extra
    if (!_.isEmpty(config.globals)) {
      _.forEach(config.globals, function(version, pkg) {

        // Ensure globals is arrayed
        config.extras = config.extras || [];

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

        // Push in our composer deps
        config.extras.push(nig.join(' '));

      });
    }

    // Put it all together
    services[name] = node;

    // Return our service
    return services;

  };

  /**
   * Metadata about our service
   */
  var info = function() {
    return {};
  };

  /**
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
    info: info,
    networks: networks,
    services: services,
    versions: versions,
    volumes: volumes,
    configDir: __dirname
  };

};
