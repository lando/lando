'use strict';

const _ = require('lodash');
const env = require('./lib/env.js');
const ip = require('ip');
const path = require('path');

// Helper for default config
const getDefaultConf = (env, lando) => ({
  composeBin: env.getComposeExecutable(),
  composeVersion: '3.2',
  containerGlobalEnv: {},
  dockerBin: env.getDockerExecutable(),
  dockerBinDir: env.getDockerBinPath(),
  engineId: lando.user.getUid(),
  engineGid: lando.user.getGid(),
  engineScriptsDir: path.join(lando.config.userConfRoot, 'engine', 'scripts'),
});

// Helper to get default env
const getDefaultEnv = config => ({
  LANDO_ENGINE_CONF: config.userConfRoot,
  LANDO_ENGINE_ID: config.engineId,
  LANDO_ENGINE_GID: config.engineGid,
  LANDO_ENGINE_HOME: config.home,
  LANDO_ENGINE_IP: config.engineConfig.host,
  LANDO_ENGINE_REMOTE_IP: (process.platform === 'linux') ? ip.address() : 'host.docker.internal',
  LANDO_ENGINE_SCRIPTS_DIR: config.engineScriptsDir,
});

module.exports = lando => {
  // Add some config for the engine
  lando.events.on('post-bootstrap', 1, lando => {
    lando.log.info('Configuring engine plugin');

    // Merge user opts over the defaults, this allows users to set their own things
    lando.config = lando.utils.config.merge(getDefaultConf(env, lando), lando.config);

    // Strip all DOCKER_ and COMPOSE_ envvars
    lando.config.env = lando.utils.config.stripEnv('DOCKER_');
    lando.config.env = lando.utils.config.stripEnv('COMPOSE_');

    // Set up the default engine config if needed
    lando.config.engineConfig = env.getEngineConfig(lando.config);

    // Set the ENV
    _.forEach(getDefaultEnv(lando.config), (value, key) => {
      lando.config.env[key] = value;
    });

    // Add some docker compose protection on windows
    if (process.platform === 'win32') lando.config.env.COMPOSE_CONVERT_WINDOWS_PATHS = 1;

    // Log it
    lando.log.verbose('Engine plugin configured with %j', lando.config);

    // Add utilities
    lando.utils.engine = require('./lib/utils');

    // Move our scripts over and set useful ENV we can use
    lando.log.verbose('Copying config from %s to %s', path.join(__dirname, 'scripts'), lando.config.engineScriptsDir);
    lando.utils.engine.moveConfig(path.join(__dirname, 'scripts'), lando.config.engineScriptsDir);
  });

  // Add some config for the engine
  lando.events.on('post-bootstrap', 2, lando => {
    lando.log.info('Initializing engine plugin');
    lando.engine = require('./engine')(lando);
  });
};
