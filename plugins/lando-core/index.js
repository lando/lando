'use strict';

module.exports = lando => {
  // Add core commands to lando
  lando.events.on('post-bootstrap', lando => {
    // Log
    lando.log.info('Initializing core plugin');
    // Add the tasks command
    lando.tasks.add('config', require('./tasks/config')(lando));
    lando.tasks.add('version', require('./tasks/version')(lando));
  });
};

/*
ENGINE PLUGIN
// Helper for default config
const getDefaultConf = (env, lando) => ({
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
    // Set the ENV
    _.forEach(getDefaultEnv(lando.config), (value, key) => {
      lando.config.env[key] = value;
    });
    // Move our scripts over and set useful ENV we can use
    lando.log.verbose('Copying config from %s to %s', path.join(__dirname, 'scripts'), lando.config.engineScriptsDir);
    lando.utils.engine.moveConfig(path.join(__dirname, 'scripts'), lando.config.engineScriptsDir);
  });
};
*/
