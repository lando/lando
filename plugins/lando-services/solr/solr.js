/**
 * Lando solr service builder
 *
 * @name solr
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
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

    // Config version differences
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
      },
      custom: {}
    };

    // Get our solr config
    var solrConfig = versionConfig[config.version];

    // Define config mappings
    var configFiles = {
      conf: solrConfig.confDir || '/solrconf'
    };

    // Default solr service
    var solr = {
      image: solrConfig.image,
      environment: {
        TERM: 'xterm'
      },
      volumes: [
        'data:' + solrConfig.dataDir
      ],
      command: solrConfig.command
    };

    // Add data dir if applicable
    // @todo

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

    // Handle ssl option
    // @todo:
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

    // Handle custom config files
    _.forEach(configFiles, function(file, type) {
      if (_.has(config, 'config.' + type)) {
        var local = config.config[type];
        var customConfig = buildVolume(local, file, '$LANDO_APP_ROOT_BIND');
        solr.volumes = addConfig(customConfig, solr.volumes);
      }
    });

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
        host: name,
        port: 8983
      },
      'external_connection': {
        host: 'localhost',
        port: config.portforward || 'not forwarded'
      }
    };

    // Return the collected info
    return info;

  };

  /**
   * Return the volumes needed
   */
  var volumes = function() {
    return {data: {}};
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
