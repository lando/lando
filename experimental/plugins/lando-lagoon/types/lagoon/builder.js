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
      const lagoon = _.omit(options.lagoon, ['volumes', 'volumes_from', 'networks', 'user']);

      // Normalize the dockerfile situation
      // We need to do this again since this isnt technically an override
      if (_.has(lagoon, 'build.context')) lagoon.build.context = path.join(options.root);
      // Refactor the lagoon route for lando
      lagoon.environment.LAGOON_ROUTE = `https://${options.app}.${options._app._config.domain}`;
      // Set up lando user perm handling
      options.meUser = (options.meUser) ? options.meUser : 'user';
      lagoon.environment = _.merge({}, {
        LANDO_SERVICE_TYPE: 'lagoon',
        LANDO_WEBROOT_USER: 'user',
        LANDO_WEBROOT_GROUP: 'root',
        LANDO_WEBROOT_UID: '1000',
        LANDO_WEBROOT_GID: '0',
      }, lagoon.environment);

      // Push the lagoon config on top of Landos, this allows the user
      sources.push({services: _.set({}, options.name, lagoon)});

      // ADD IN OTHER LANDO STUFF? info? etc?
      super(id, options, ...sources);
    };
  },
};
