/**
 * Lando asp service builder
 *
 * @name asp
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = require('lodash');
  var addScript = lando.services.addScript;

  /**
   * Supported versions for asp
   */
  var versions = [
    '2',
    '2.0',
    '1',
    '1.1',
    '1.0',
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
   * Build out asp
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
      '/usr/local/bundle',
      '/var/www/.asp'
    ];

    // Basic config
    var cliCmd = 'tail -f /dev/null';
    var version = config.version || '2';
    var command = config.command || cliCmd;

    // Arrayify the command if needed
    if (!_.isArray(command)) {
      command = [command];
    }

    // Start with the python base
    var asp = {
      image: 'microsoft/dotnet:' + version + '-sdk-jessie',
      environment: {
        TERM: 'xterm',
        PATH: path.join(':'),
        ASPNETCORE_URLS: 'http://+:80'
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
      asp.ports = [];
    }

    // And if not we need to add in an additional cli container so that we can
    // run things like lando bundler install before our app starts up
    else {

      // Spoof the config and add some internal properties
      var cliConf = {
        type: 'asp:' + version,
        _app: config._app,
        _root: config._root,
        _mount: config._mount
      };

      // Extract the cli service and add here
      var cliCompos = lando.services.build('cli', 'asp:' + version, cliConf);
      services[name + '_cli'] = cliCompos.services.cli;

    }

    // Generate some certs we can use
    if (config.ssl) {

      // Add the ssl port
      asp.ports.push('443');

      // Add in an add cert task
      asp.volumes = addScript('add-cert.sh', asp.volumes);

    }

    // Put it all together
    services[name] = asp;

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
