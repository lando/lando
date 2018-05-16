'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;

  /*
   * Supported versions for python
   */
  var versions = [
    '3',
    '3.6',
    '3.5',
    '3.4',
    '3.3',
    '2',
    '2.7',
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
   * Build out python
   */
  var services = function(name, config) {

    // Start a services collector
    var services = {};

    // pip install path
    var pythonUserBase = '/var/www/.local';

    // Path
    // @todo: need to add global gem locaation?
    var path = [
      pythonUserBase + '/bin',
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
      'python_share:/var/www/.cache/pip',
      'python_share:' + pythonUserBase
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
    var python = {
      image: 'python:' + version + '-jessie',
      environment: {
        TERM: 'xterm',
        PATH: path.join(':'),
        PIP_USER: 'true',
        PYTHONUSERBASE: pythonUserBase
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
      python.ports = [];
    }

    // And if not we need to add in an additional cli container so that we can
    // run things like lando bundler install before our app starts up
    else {

      // Spoof the config and add some internal properties
      var cliConf = {
        type: 'python:' + version,
        _app: config._app,
        _root: config._root,
        _mount: config._mount
      };

      // Extract the cli service and add here
      var cliCompos = lando.services.build('cli', 'python:' + version, cliConf);
      var cliName = name + '_cli';
      services[cliName] = cliCompos.services.cli;

      // Add a flag so we know this is built behind the the scenes
      config._hiddenServices = [cliName];

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
  var info = function() {
    return {};
  };

  /*
   * Return the volumes needed
   */
  var volumes = function() {
    return {
      'python_share': {}
    };
  };

  return {
    defaultVersion: '3.6',
    info: info,
    networks: networks,
    services: services,
    versions: versions,
    volumes: volumes,
    configDir: __dirname
  };

};
