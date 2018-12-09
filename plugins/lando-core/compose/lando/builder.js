'use strict';

// Modules
const _ = require('lodash');
const chalk = require('chalk');
const fs = require('fs-extra');
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
        home = '',
        legacy = [],
        project = '',
        overrides = {},
        refreshCerts = false,
        remoteFiles = {},
        scripts = [],
        ssl = false,
        supported = [],
        root = '',
        webroot = '/app',
      } = {},
      ...sources
    ) {
      // If this version is not supported throw an error
      if (!_.includes(_.flatten([supported, ['custom']]), version)) {
        throw Error(`${type} version ${version} is not supported`);
      }
      if (_.includes(legacy, version)) {
        console.log(chalk.yellow(`${type} version ${version} is a legacy version. We recommend upgrading.`));
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

      // Handle ports
      const ports = [];
      // Handle ssl
      if (ssl) {
        volumes.push(`${addCertsScript}:/scripts/add-cert.sh`);
        ports.push('443');
      }

      // Handle cert refresh
      // @TODO: this might only be relevant to the proxy, if so let's move it there
      if (refreshCerts) volumes.push(`${refreshCertsScript}:/scripts/refresh-certs.sh`);

      // Handle Environment
      const environment = {
        LANDO_SERVICE_NAME: name,
        LANDO_SERVICE_TYPE: type,
      };

      // Add stuff into our primary service
      sources.push({services: _.set({}, name, {
        entrypoint: '/lando-entrypoint.sh',
        environment,
        ports,
        volumes,
      })});

      // Process overrides
      // @TODO: how do we handle "hidden services eg nginx for php-fpm"?
      // Map any build or volume keys to the correct path
      if (_.has(overrides, 'build')) {
        overrides.build = utils.normalizePath(overrides.build, root);
      }
      if (_.has(overrides, 'volumes')) {
        overrides.volumes = _.map(overrides.volumes, volume => {
          if (!_.includes(volume, ':')) {
            return volume;
          } else {
            const local = utils.getHostPath(volume);
            const remote = volume.split(':')[1];
            // @TODO: i dont think below does anything?
            const excludes = _.keys(volumes).concat(_.keys(overrides.volumes));
            const host = utils.normalizePath(local, root, excludes);
            return [host, remote].join(':');
          }
        });
      }
      sources.push({services: _.set({}, name, overrides)});

      // Pass it down
      super(id, ...sources);
    };

    /*
     * @TODO
     */
    info({name, type, config = {}, version = 'default'}, info) {
      info.type = type;
      info.version = version;
      info.hostnames.push(name);
      info.config = config;
      return info;
    };
  },
};
