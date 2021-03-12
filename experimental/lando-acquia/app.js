'use strict';

// Modules
const _ = require('lodash');
const utils = require('./lib/utils');


module.exports = (app, lando) => {
  // Add additional things to cleanse
  app.log.alsoSanitize('acquia-auth');
  app.log.alsoSanitize('acquia-key');

  // Only do this on acquia recipes
  if (_.get(app, 'config.recipe') === 'acquia') {
    app.events.on('pre-init', 1, () => {
      app.acquiaKeyCache = 'acquia.keys';
      app.acquiaKeys = lando.cache.get(app.acquiaKeyCache) || [];
      app.hostKeys = utils.getHostKeys(lando.config.home) || [];
    });
  }
};
