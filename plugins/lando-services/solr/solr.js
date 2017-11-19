/**
 * Lando solr service builder
 *
 * @name solr
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var path = require('path');

  var addConfig = lando.services.addConfig;
  //var addScript = lando.services.addScript;
  var buildVolume = lando.services.buildVolume;

  /**
   * Supported versions for nginx
   */
  var versions = [
    '3.6',
    '4.10',
    '5.5',
    '6.3',
    '6.4',
    '6.5',
    '6.6',
    '7.0',
    '7.1',
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
   * Build out nginx services
   */
  var services = function(name, config) {

    // Start a services collector
    var services = {};

    // Early config version differences
    var versionConfig = {
      '3.6': {
        image: 'actency/docker-solr:3.6',
        confDir: '/opt/solr/example/solr/conf',
        command: '/bin/bash -c "cd /opt/solr/example;' +
          ' java -Djetty.port=8983 -jar start.jar"',
        dataDir: '/opt/solr/example/solr/data'
      },
      '4.10': {
        image: 'actency/docker-solr:4.10',
        confDir: '/opt/solr-4.10.4/example/solr/collection1/conf/',
        command: '/bin/bash -c "/opt/solr/bin/solr -f -p 8983"',
        dataDir: '/opt/solr-4.10.4/example/solr/collection1/data/'
      }
    };

    // Figure out the name of the core
    var core = config.core || 'index1';

    // Start up the solr config collector
    var solrConfig = {};

    // Figure out which config base to use
    if (_.includes(['3.6', '4.10'], config.version)) {
      solrConfig = versionConfig[config.version];
    }
    else {
      solrConfig = {
        image: 'solr:' + config.version,
        confDir: '/solrconf/conf',
        dataDir: '/opt/solr/server/solr/mycores/',
        command: ['docker-entrypoint.sh', 'solr-precreate', core].join(' ')
      };
    }

    // Default solr service
    var solr = {
      image: solrConfig.image,
      environment: {
        TERM: 'xterm'
      },
      volumes: ['data_' + name + ':' + solrConfig.dataDir],
      command: solrConfig.command
    };

    // Handle port forwarding
    if (config.portforward) {

      // If true assign a port automatically
      if (config.portforward === true) {
        solr.ports = ['8983'];
      }

      // Else use the specified port
      else {
        solr.ports = [config.portforward + ':8983'];
      }

    }

    // Handle custom config dir
    if (_.has(config, 'config.conf')) {

      // Grab the local file
      var local = config.config.conf;
      var confDir = solrConfig.confDir;

      // Share in the custom config to the conf dir spot
      var globalConfig = buildVolume(local, confDir, '$LANDO_APP_ROOT_BIND');
      solr.volumes = addConfig(globalConfig, solr.volumes);

      // If this is a recent version of solr we need to add to the config as an arg
      // and also map to the core
      if (!_.includes(['3.6', 4.10], config.version)) {

        // Augment the start up command
        var command = solr.command.split(' ');
        command.push('/solrconf');
        solr.command = command.join(' ');

        // Share the config to the core as well
        var coreConf = path.join(solrConfig.dataDir, core, 'conf');
        var coreConfig = buildVolume(local, coreConf, '$LANDO_APP_ROOT_BIND');
        solr.volumes = addConfig(coreConfig, solr.volumes);

      }

    }

    // Handle ssl option
    // @todo: figure out how to handle SSL options
    /*
    if (config.ssl) {

      // Add the SSL port
      nginx.ports.push('443');

      // If we don't have a custom default ssl config lets use the default one
      var sslConf = ['nginx', 'default-ssl.conf'];
      var sslVolume = buildVolume(sslConf, configFiles.server, defaultConfDir);
      nginx.volumes = addConfig(sslVolume, nginx.volumes);

      // Add in an add cert task
      nginx.volumes = addScript('add-cert.sh', nginx.volumes);

    }
    */

    // Put it all together
    services[name] = solr;

    // Return our service
    return services;

  };

  /**
   * Metadata about our service
   */
  var info = function(name, config) {

    // Add in generic info
    var info = {
      'internal_connection': {
        core: config.core || 'index1',
        host: name,
        port: config.port || 8983
      },
      'external_connection': {
        core: config.core || 'index1',
        host: 'localhost',
        port: config.portforward || 'not forwarded'
      }
    };

    // Show the config files being used if they are custom
    if (!_.isEmpty(config.config)) {
      info.config  = config.config;
    }

    // Return the collected info
    return info;

  };

  /**
   * Return the volumes needed
   */
  var volumes = function(name) {
    var vols = {};
    vols['data_' + name] = {};
    return vols;
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
