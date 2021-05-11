'use strict';

// Modules
const _ = require('lodash');
const path = require('path');

/*
 * The lowest level lando service
 */
module.exports = {
  name: '_lagoon',
  parent: '_lando',
  builder: parent => class LandoAppserver extends parent {
    constructor(id, options = {}, ...sources) {
      // Strip out lagoon stuff we dont need
      const lagoon = options.lagoon;
      // Just get all hostnames for now
      // @TODO: eventually this should just the internal docker hostname
      // for whatever container is serving the app
      const hostnames = _.get(options, '_app.lagoon.containers', []);

      // Normalize the dockerfile situation
      // We need to do this again since this isnt technically an override
      if (_.has(lagoon, 'build.context')) lagoon.build.context = path.join(options.root);

      // Handle portfoward in the usual way
      if (options.portforward) {
        if (options.portforward === true) {
          sources.push({services: _.set({}, options.name, {ports: [options.port]})});
        } else {
          sources.push({services: _.set({}, options.name, {ports: [`${options.portforward}:${options.port}`]})});
        }
      }

      // Refactor the lagoon routes for lando
      lagoon.environment.LAGOON_PROJECT = options._app.lagoon.config.lagoon.project;
      lagoon.environment.LAGOON_ROUTE = `https://${options.app}.${options._app._config.domain}`;
      lagoon.environment.LAGOON_LOCALDEV_URL = `https://${options.app}.${options._app._config.domain}`;
      lagoon.environment.LAGOON_ROUTES = hostnames.concat([
        `${options.app}.${options._app._config.domain}`,
        'localhost',
      ]).join(',');

      // Set up lando user perm handling
      options.meUser = (options.meUser) ? options.meUser : 'user';
      options.meGroup = (options.meGroup) ? options.meGroup : options.meUser;

      // Merge in the usual envvars but make sure user set ones take priority
      lagoon.environment = _.merge({}, {
        LANDO_SERVICE_TYPE: 'lagoon',
        LANDO_WEBROOT_USER: options.meUser,
        LANDO_WEBROOT_GROUP: options.meGroup,
        LANDO_RESET_DIR: '/home',
      }, lagoon.environment);

      // Push the lagoon config on top of Landos, this allows the user
      sources.push({services: _.set({}, options.name, lagoon)});

      // ADD IN OTHER LANDO STUFF? info? etc?
      super(id, options, ...sources);
    };
  },
};
