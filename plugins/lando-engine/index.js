/**
 * Our core plugin
 *
 * @name index
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var ip = lando.node.ip;
  var env = require('./lib/env.js');
  var url = require('url');

  // Add some config for the engine
  lando.events.on('post-bootstrap', 1, function(lando) {

    // Log
    lando.log.info('Configuring engine plugin');

    // Build the default config object
    var defaultEngineConfig = {
      composeBin: env.getComposeExecutable(),
      composeVersion: '3.2',
      containerGlobalEnv: {},
      dockerBin: env.getDockerBinPath(),
      dockerBinDir: env.getDockerExecutable(),
      engineConfig: env.getEngineConfig(),
      engineHost: env.getEngineConfig().host,
      engineId: lando.user.getUid(),
      engineGid: lando.user.getGid()
    };

    // Merge defaults over the config, this allows users to set their own things
    lando.config = lando.utils.config.merge(defaultEngineConfig, lando.config);

    // Strip all DOCKER_ envvars
    lando.config.env = lando.utils.config.stripEnv('DOCKER_');

    // Parse the docker host url
    var dockerHost = url.format({
      protocol: 'tcp',
      slashes: true,
      hostname: lando.config.engineConfig.host,
      port: lando.config.engineConfig.port
    });

    // Set the ENV
    lando.config.env.LANDO_ENGINE_ID = lando.config.engineId;
    lando.config.env.LANDO_ENGINE_GID = lando.config.engineGid;
    lando.config.env.LANDO_ENGINE_HOME = lando.config.home;
    lando.config.env.LANDO_ENGINE_IP = dockerHost;
    lando.config.env.LANDO_ENGINE_REMOTE_IP = ip.address();

    // Log it
    lando.log.verbose('Engine configured with %j', lando.config);

    // Add utilities
    lando.utils.engine = require('./lib/utils');

  });

  // Add some config for the engine
  lando.events.on('post-bootstrap', 2, function(lando) {

    // Log
    lando.log.info('Initializing engine plugin');

    // Add the engine
    lando.engine = require('./engine')(lando);

  });


};
