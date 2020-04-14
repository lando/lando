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
      const lagoon = _.omit(options.lagoon, ['volumes', 'volumes_from', 'networks']);

      // Swap the user if needed
      if (lagoon.user === 1000) lagoon.user = options._app._config.uid;
      // Normalize the dockerfile situation
      // We need to do this again since this isnt technically an override
      if (_.has(lagoon, 'build.context')) lagoon.build.context = path.join(options.root);
      // Add in some helpful lando things
      lagoon.environment.LANDO_SERVICE_TYPE = 'lagoon';

      // Push the lagoon config on top of Landos
      sources.push({services: _.set({}, options.name, lagoon)});

      // ADD IN OTHER LANDO STUFF? info? etc?
      super(id, options, ...sources);
    };
  },
};
