'use strict';

// Modules
const _ = require('lodash');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
// @TODO: not the best to reach back this far
const moveConfig = require('./../../../../lib/utils').moveConfig;
const utils = require('./../../lib/utils');

/*
 * The lowest level lando service, this is where a lot of the deep magic lives
 * @TODO
 */
module.exports = {
  name: '_lando',
  parent: '_compose',
  builder: parent => class LandoService extends parent {
    constructor(
      id,
      {
        name,
        type,
        userConfRoot,
        version,
        app = '',
        confDest = '',
        confSrc = '',
        config = {},
        data = `data_${name}`,
        dataHome = `home_${name}`,
        home = '',
        moreHttpPorts = [],
        info = {},
        legacy = [],
        meUser = 'www-data',
        patchesSupported = false,
        ports = [],
        project = '',
        overrides = {},
        refreshCerts = false,
        remoteFiles = {},
        scripts = [],
        ssl = false,
        sslExpose = true,
        supported = ['custom'],
        root = '',
        webroot = '/app',
      } = {},
      ...sources
    ) {
      // Add custom to list of supported
      supported.push('custom');
      // If this version is not supported throw an error
      // @TODO: get this someplace else for unit tezting
      if (!_.includes(supported, version)) {
        if (!patchesSupported || !_.includes(utils.stripWild(supported), utils.stripPatch(version))) {
          throw Error(`${type} version ${version} is not supported`);
        }
      }
      if (_.includes(legacy, version)) {
        console.log(chalk.yellow(`${type} version ${version} is a legacy version! We recommend upgrading.`));
      }

      // Move our config into the userconfroot if we have some
      // NOTE: we need to do this because on macOS and Windows not all host files
      // are shared into the docker vm
      if (fs.existsSync(confSrc)) moveConfig(confSrc, confDest);

      // Get some basic locations
      const scriptsDir = path.join(userConfRoot, 'scripts');
      const entrypoint = path.join(scriptsDir, 'lando-entrypoint.sh');
      const addCertsScript = path.join(scriptsDir, 'add-cert.sh');
      const refreshCertsScript = path.join(scriptsDir, 'refresh-certs.sh');
      const loadKeysScript = path.join(scriptsDir, 'load-keys.sh');

      // Handle volumes
      const volumes = [
        `${userConfRoot}:/lando:delegated`,
        `${scriptsDir}:/helpers`,
        `${entrypoint}:/lando-entrypoint.sh`,
        `${dataHome}:/var/www`,
      ];

      // Add in some more dirz if it makes sense
      if (home) {
        volumes.push(`${home}:/user:delegated`);
        volumes.push(`${loadKeysScript}:/scripts/load-keys.sh`);
      }

      // Add in any custom pre-runscripts
      _.forEach(scripts, script => {
        const local = path.resolve(root, script);
        const remote = path.join('/scripts', path.basename(script));
        volumes.push(`${local}:${remote}`);
      });

      // Handle custom config files
      _.forEach(config, (file, type) => {
        if (_.has(remoteFiles, type)) {
          const local = path.resolve(root, config[type]);
          const remote = remoteFiles[type];
          volumes.push(`${local}:${remote}`);
        }
      });

      // Handle ssl
      if (ssl) {
        volumes.push(`${addCertsScript}:/scripts/add-cert.sh`);
        if (sslExpose) ports.push('443');
      }

      // Handle cert refresh
      // @TODO: this might only be relevant to the proxy, if so let's move it there
      if (refreshCerts) volumes.push(`${refreshCertsScript}:/scripts/refresh-certs.sh`);
      // Handle Environment
      const environment = {LANDO_SERVICE_NAME: name, LANDO_SERVICE_TYPE: type};
      // Handle http ports
      const labels = {'io.lando.http-ports': _.uniq(['80', '443'].concat(moreHttpPorts)).join(',')};

      // Add named volumes and other thingz into our primary service
      const namedVols = {};
      _.set(namedVols, data, {});
      _.set(namedVols, dataHome, {});
      sources.push({
        services: _.set({}, name, {entrypoint: '/lando-entrypoint.sh', environment, labels, ports, volumes}),
        volumes: namedVols,
      });

      // Add our overrides at the end
      // @TODO: get normalizeoverrides to work on windows
      // @NOTE: kick iff
      if (process.platform === 'win32') {
        sources.push({services: _.set({}, name, overrides)});
      } else {
        sources.push({services: _.set({}, name, utils.normalizeOverrides(overrides))});
      }

      // Add some info basics
      info.config = config;
      info.service = name;
      info.type = type;
      info.version = version;
      info.meUser = meUser;

      // Pass it down
      super(id, info, ...sources);
    };
  },
};
