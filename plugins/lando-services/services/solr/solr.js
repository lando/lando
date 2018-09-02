'use strict';

module.exports = lando => {
  // Modules
  const _ = lando.node._;
  const path = require('path');

  const addConfig = lando.utils.services.addConfig;
  const buildVolume = lando.utils.services.buildVolume;

  /*
   * Supported versions for nginx
   */
  const versions = [
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
    'custom',
  ];

  /*
   * Return the networks needed
   */
  const networks = () => ({});

  /*
   * Build out nginx services
   */
  const services = (name, config) => {
    // Start a services collector
    const services = {};
    // Early config version differences
    const versionConfig = {
      '3.6': {
        image: 'actency/docker-solr:3.6',
        confDir: '/opt/solr/example/solr/conf',
        command: '/bin/bash -c "cd /opt/solr/example;' +
          ' java -Djetty.port=8983 -jar start.jar"',
        dataDir: '/opt/solr/example/solr/data',
      },
      '4.10': {
        image: 'actency/docker-solr:4.10',
        confDir: '/opt/solr-4.10.4/example/solr/collection1/conf/',
        command: '/bin/bash -c "/opt/solr/bin/solr -f -p 8983"',
        dataDir: '/opt/solr-4.10.4/example/solr/collection1/data/',
      },
    };

    // Figure out the name of the core
    const core = config.core || 'index1';

    // Start up the solr config collector
    const solrConfig = {};

    // Normalize our install_dependencies_as_root_internal
    config.install_dependencies_as_root_internal = config.install_dependencies_as_root_internal || [];

    // Figure out which config base to use
    if (_.includes(['3.6', '4.10'], config.version)) {
      solrConfig = versionConfig[config.version];
    } else {
      solrConfig = {
        image: 'solr:' + config.version,
        confDir: '/solrconf/conf',
        dataDir: '/opt/solr/server/solr/mycores/',
        command: ['docker-entrypoint.sh', 'solr-precreate', core].join(' '),
      };
    }

    // Default solr service
    const solr = {
      image: solrConfig.image,
      environment: {
        TERM: 'xterm',
      },
      volumes: ['data_' + name + ':' + solrConfig.dataDir],
      command: solrConfig.command,
    };

    // Handle port forwarding
    if (config.portforward) {
      // If true assign a port automatically
      if (config.portforward === true) {
        solr.ports = ['8983'];
      } else {
        solr.ports = [config.portforward + ':8983'];
      }
    }

    // Add some permission helpers for non custom versions
    // This is conditional for things like the pantheon recipe that need to
    // use a custom image that may or may not have the solr user
    if (config.version !== 'custom') {
      const dataDir = solrConfig.dataDir;
      const dataDirCmd = ['chown', '-R', 'solr:solr', dataDir].join(' ');
      config.install_dependencies_as_root_internal.unshift(dataDirCmd);
    }

    // Handle custom config dir
    if (_.has(config, 'config.conf')) {
      // Grab the local file
      const local = config.config.conf;
      const confDir = solrConfig.confDir;

      // Share in the custom config to the conf dir spot
      const globalConfig = buildVolume(local, confDir, '$LANDO_APP_ROOT_BIND');
      solr.volumes = addConfig(globalConfig, solr.volumes);

      // If this is a recent version of solr we need to add to the config as an arg
      if (!_.includes(['3.6', '4.10'], config.version)) {
        // Augment the start up command
        const command = solr.command.split(' ');
        command.push('/solrconf');
        solr.command = command.join(' ');

        // Symlink the core config to the system config
        const coreConf = path.join(solrConfig.dataDir, core, 'conf');
        const coreConfSymCmd = ['ln', '-sf', confDir, coreConf].join(' ');
        const coreRmCmd = ['rm', '-rf', coreConf].join(' ');
        config.install_dependencies_as_root_internal.unshift(coreConfSymCmd);
        config.install_dependencies_as_root_internal.unshift(coreRmCmd);
      }
    }

    // Handle ssl option
    // @todo: figure out how to handle SSL options
    /*
    if (config.ssl) {

      // Add the SSL port
      nginx.ports.push('443');

      // If we don't have a custom default ssl config lets use the default one
      const sslConf = ['nginx', 'default-ssl.conf'];
      const sslVolume = buildVolume(sslConf, configFiles.server, defaultConfDir);
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

  /*
   * Metadata about our service
   */
  const info = (name, config) => {
    // Add in generic info
    const info = {
      'internal_connection': {
        core: config.core || 'index1',
        host: name,
        port: config.port || 8983,
      },
      'external_connection': {
        core: config.core || 'index1',
        host: 'localhost',
        port: config.portforward || 'not forwarded',
      },
    };

    // Show the config files being used if they are custom
    if (!_.isEmpty(config.config)) {
      info.config = config.config;
    }

    // Return the collected info
    return info;
  };

  /*
   * Return the volumes needed
   */
  const volumes = function(name) {
    const vols = {};
    vols['data_' + name] = {};
    return vols;
  };

  return {
    defaultVersion: '7.1',
    info: info,
    networks: networks,
    services: services,
    versions: versions,
    volumes: volumes,
    configDir: __dirname,
  };
};
