/**
 * Lando ruby service builder
 *
 * @name ruby
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = require('lodash');
  var addScript = lando.services.addScript;

  /**
   * Supported versions for ruby
   */
  var versions = [
    '2.4',
    '2.4-rails',
    '2.2',
    '2.1',
    '1.9',
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
   * Build out ruby
   */
  var services = function(name, config) {

    // Start a services collector
    var services = {};

    // Path
    // @todo: need to add global gem location?
    var path = [
      '/usr/local/sbin',
      '/usr/local/bin',
      '/usr/local/bundle/bin',
      '/usr/sbin',
      '/usr/bin',
      '/sbin',
      '/bin'
    ];

    var gemUserBase = '/var/www/.gem';
    // Volumes
    // Need to add gloval ruby gem location?
    var vols = [
      '/usr/local/bin',
      '/usr/local/share',
      '/usr/local/bundle',
      'gemShare:' + gemUserBase
    ];

    // Basic config
    var cliCmd = 'tail -f /dev/null';
    var version = config.version || '2';
    var command = config.command || cliCmd;

    // Arrayify the command if needed
    if (!_.isArray(command)) {
      command = [command];
    }

    var isRails = function(version) {
      return version.indexOf('-rails') > -1;
    };

    var img = isRails(version) ?
      'devwithlando/ruby:' + version :
      'ruby:' + version;
    // Start with the ruby base
    var ruby = {
      image: img,
      environment: {
        TERM: 'xterm',
        PATH: path.join(':'),
        GEM_HOME: gemUserBase,
        GEM_PATH: gemUserBase,
        BUNDLE_PATH: gemUserBase
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
      ruby.ports = [];
    }

    // And if not we need to add in an additional cli container so that we can
    // run things like lando bundler install before our app starts up
    else {

      // Spoof the config and add some internal properties
      var cliConf = {
        type: 'ruby:' + version,
        _app: config._app,
        _root: config._root,
        _mount: config._mount
      };

      // Extract the cli service and add here
      var cliCompose = lando.services.build('cli', 'ruby:' + version, cliConf);
      services[name + '_cli'] = cliCompose.services.cli;

    }

    // Generate some certs we can use
    if (config.ssl) {

      // Add the ssl port
      ruby.ports.push('443');

      // Add in an add cert task
      ruby.volumes = addScript('add-cert.sh', ruby.volumes);

    }

    // Put it all together
    services[name] = ruby;

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
      data: {},
      gemShare: {}
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
