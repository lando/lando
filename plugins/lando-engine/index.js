'use strict';

module.exports = function(lando) {

  // Modules
  var env = require('./lib/env.js');
  var path = require('path');
  var url = require('url');

  // Add some config for the engine
  lando.events.on('post-bootstrap', 1, function(lando) {

    // Log
    lando.log.info('Configuring engine plugin');

    // Engine script directory
    var esd = path.join(lando.config.userConfRoot, 'engine', 'scripts');

    // Build the default config object
    var defaultEngineConfig = {
      composeBin: env.getComposeExecutable(),
      composeVersion: '3.2',
      containerGlobalEnv: {},
      dockerBin: env.getDockerExecutable(),
      dockerBinDir: env.getDockerBinPath(),
      engineConfig: env.getEngineConfig(),
      engineHost: env.getEngineConfig().host,
      engineId: lando.user.getUid(),
      engineGid: lando.user.getGid(),
      engineScriptsDir: esd
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
    lando.config.env.LANDO_ENGINE_CONF = lando.config.userConfRoot;
    lando.config.env.LANDO_ENGINE_ID = lando.config.engineId;
    lando.config.env.LANDO_ENGINE_GID = lando.config.engineGid;
    lando.config.env.LANDO_ENGINE_HOME = lando.config.home;
    lando.config.env.LANDO_ENGINE_IP = dockerHost;
    lando.config.env.LANDO_ENGINE_REMOTE_IP = 'host.docker.internal';
    lando.config.env.LANDO_ENGINE_SCRIPTS_DIR = lando.config.engineScriptsDir;

    // Add some docker compose protection on windows
    if (process.platform === 'win32') {
      lando.config.env.COMPOSE_CONVERT_WINDOWS_PATHS = 1;
    }

    // Log it
    lando.log.verbose('Engine plugin configured with %j', lando.config);

    // Add utilities
    lando.utils.engine = require('./lib/utils');

    // Move our scripts over and set useful ENV we can use
    var scriptFrom = path.join(__dirname, 'scripts');
    var scriptTo = lando.config.engineScriptsDir;
    lando.log.verbose('Copying config from %s to %s', scriptFrom, scriptTo);
    lando.utils.engine.moveConfig(scriptFrom, scriptTo);

  });

  // Add some config for the engine
  lando.events.on('post-bootstrap', 2, function(lando) {

    // Log
    lando.log.info('Initializing engine plugin');

    // Add the engine
    lando.engine = require('./engine')(lando);

  });

};
