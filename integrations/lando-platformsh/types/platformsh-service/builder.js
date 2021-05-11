'use strict';

// Modules
const _ = require('lodash');
const path = require('path');

/*
 * The lowest level lando service
 */
module.exports = {
  name: '_platformsh_service',
  parent: '_lando',
  builder: parent => class LandoPlatformService extends parent {
    constructor(id, options = {}, ...sources) {
      // Get some stuff from our parsed platform config
      const runConfigPath = _.get(options, 'runConfig.file');
      const bootScript = path.join(options.userConfRoot, 'scripts', 'psh-boot.sh');

      // If portforward is not set by the user than compute its value
      if (_.isNil(options.portforward)) options.portforward = !_.isEmpty(options.platformsh.creds);
      // Handle portfoward in the usual way
      if (options.portforward) {
        if (options.portforward === true) {
          sources.push({services: _.set({}, options.name, {ports: [options.port]})});
        } else {
          sources.push({services: _.set({}, options.name, {ports: [`${options.portforward}:${options.port}`]})});
        }
      }

      // Add some lando info if portforward is on
      options.info = _.merge({}, options.info, {
        creds: _(options.platformsh.creds)
          .map(cred => _.pickBy({
            internal_hostname: cred.host,
            password: cred.password,
            path: cred.path,
            port: cred.port,
            user: cred.username,
          }, _.identity))
          .value(),
        internal_connection: {
          host: options.name,
          port: options.port,
        },
        external_connection: {
          host: options._app._config.bindAddress,
          port: options.portforward || 'not forwarded',
        },
      });

      // Set the docker things we need for all appservers
      const service = {
        command: 'exec init',
        environment: {LANDO_SERVICE_TYPE: '_platformsh_appserver'},
        privileged: true,
        volumes: [
          `${runConfigPath}:/run/config.json`,
          `${bootScript}:/scripts/001-boot-platformsh`,
        ],
      };

      // Add in aliases if we have them
      if (!_.isEmpty(options.platformsh.aliases)) {
        service.networks = {default: {
          aliases: _(options.platformsh.aliases)
            .map(alias => `${alias}.internal`)
            .value(),
        }};
      }

      // ADD IN OTHER LANDO STUFF? info? etc?
      sources.push({services: _.set({}, options.name, service)});
      super(id, options, ...sources);
    };
  },
};
