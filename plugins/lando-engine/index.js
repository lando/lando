'use strict';

const _ = require('lodash');
const env = require('./lib/env.js');
const fs = require('fs-extra');
const ip = require('ip');
const path = require('path');
const url = require('url');

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

// Helper for engine config
const getDefaultEngineConfig = () => ({
  socketPath: (process.platform === 'win32') ? '//./pipe/docker_engine' : '/var/run/docker.sock',
  host: '127.0.0.1',
  port: 2376,
});

// Helper setting docker host
const setDockerHost = (hostname, port = 2376) => url.format({
  protocol: 'tcp',
  slashes: true,
  hostname,
  port,
});

// Helper to get env
const getEnv = config => ({
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
    if (!_.has(lando.config, 'engineConfig')) lando.config.engineConfig = getDefaultEngineConfig();

    // Set the docker host if its non-standard
    if (lando.config.engineConfig.host !== '127.0.0.1') {
      lando.config.env.DOCKER_HOST = setDockerHost(lando.config.engineConfig.host, lando.config.engineConfig.port);
    }

    // Set the TLS/cert things if needed
    if (_.has(lando.config.engineConfig, 'certPath')) {
      lando.config.env.DOCKER_CERT_PATH = lando.config.engineConfig.certPath;
      lando.config.env.DOCKER_TLS_VERIFY = 1;
      lando.config.engineConfig.ca = fs.readFileSync(path.join(lando.config.env.DOCKER_CERT_PATH, 'ca.pem'));
      lando.config.engineConfig.cert = fs.readFileSync(path.join(lando.config.env.DOCKER_CERT_PATH, 'cert.pem'));
      lando.config.engineConfig.key = fs.readFileSync(path.join(lando.config.env.DOCKER_CERT_PATH, 'key.pem'));
    }

    // Set the ENV
    _.forEach(getEnv(lando.config), (value, key) => {
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
