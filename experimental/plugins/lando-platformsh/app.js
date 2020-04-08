'use strict';

// Modules
const _ = require('lodash');
const utils = require('./lib/utils');

module.exports = (app, lando) => {
  // Only do this on platformsh recipes
  if (_.get(app, 'config.recipe') === 'platformsh') {
    // Add tokens and other meta to our app
    app.platformshTokenCache = 'platformsh.tokens';
    app.platformshTokens = lando.cache.get(app.platformshTokenCache) || [];
    app.terminusTokens = utils.getPlatformshTokens(lando.config.home);
  }
};
