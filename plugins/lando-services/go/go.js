/**
 * Lando go service builder
 *
 * @name go
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = require('lodash');
  var addScript = lando.services.addScript;

  /**
   * Supported versions for go
   */
  var versions = [
    '1.8.4',
    '1.8',
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
   * Build out go
   */
  var services = function(name, config) {

    // Start a services collector
    var services = {};

    // Volumes
    var vols = [
      '/usr/local/bin',
      '/usr/local/share'
    ];

    // Basic config
    var cliCmd = 'tail -f /dev/null';
    var version = config.version || '1';
    var command = config.command || cliCmd;

    // Arrayify the command if needed
    if (!_.isArray(command)) {
      command = [command];
    }

    // Start with the node base
    var go = {
      image: 'golang:' + version + '-jessie',
      environment: {
        TERM: 'xterm'
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
      go.ports = [];
    }

    // And if not we need to add in an additional cli container so that we can
    // run things like lando npm install before our app starts up
    else {

      // Spoof the config and add some internal properties
      var cliConf = {
        type: 'go:' + version,
        _app: config._app,
        _root: config._root,
        _mount: config._mount
      };

      // Extract the cli service and add here
      var cliCompose = lando.services.build('cli', 'go:' + version, cliConf);
      services[name + '_cli'] = cliCompose.services.cli;

    }

    // Generate some certs we can use
    if (config.ssl) {

      // Add the ssl port
      go.ports.push('443');

      // Add in an add cert task
      go.volumes = addScript('add-cert.sh', go.volumes);

    }

    // Put it all together
    services[name] = go;

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
