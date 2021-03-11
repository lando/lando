'use strict';

// Modules
const _ = require('lodash');

module.exports = (app, lando) => {
  // Add additional things to cleanse
  app.log.alsoSanitize('acquia-auth');
  app.log.alsoSanitize('acquia-key');

  // Only do this on acquia recipes
  if (_.get(app, 'config.recipe') === 'acquia') {
    app.events.on('pre-init', 1, () => {
      app.acquiaTokenCache = 'acquia.tokens';
      app.acquiaTokens = lando.cache.get(app.acquiaTokenCache) || [];
    });
  }
};
