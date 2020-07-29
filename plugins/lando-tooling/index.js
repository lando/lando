'use strict';

// Modules
const _ = require('lodash');

module.exports = lando => {
  // Set a different default if needed
  lando.events.on('cli-ssh-run', 2, data => {
    if (data.options.service === 'appserver') {
      // Discovery
      const services = _.keys(data.options._app.services);
      const hasRecipe = _.has(data, 'options._app.recipe');

      // If this is not a recipe and we have no appserver container then set a new default
      if (!hasRecipe && !_.includes(services, 'appserver')) {
        data.options.service = _.first(services);
        data.options.s = data.options.service;
      }
    }
  });
};
