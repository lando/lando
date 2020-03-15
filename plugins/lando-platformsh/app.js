'use strict';

// Modules
const _ = require('lodash');
const PlatformshApiClient = require('./lib/client');
const utils = require('./lib/utils');

module.exports = (app, lando) => {
  // Only do this on platformsh recipes
  if (_.get(app, 'config.recipe') === 'platformsh') {
    // Set the app caches, validate tokens and update token cache
    _.forEach(['pull', 'push', 'switch'], command => {
      app.events.on(`post-${command}`, (config, answers) => {
        const api = new PlatformshApiClient(answers.auth, app.log);
        return api.auth().then(() => api.getUser().then(results => {
          const cache = {token: answers.auth, email: results.email, date: _.toInteger(_.now() / 1000)};
          // Reset this apps metacache
          lando.cache.set(app.metaCache, _.merge({}, app.meta, cache), {persist: true});
          // Set lando's store of platformsh machine tokens
          lando.cache.set(app.platformshTokenCache, utils.sortTokens(app.platformshTokens, [cache]), {persist: true});
          // Wipe out the apps tooling cache to reset with the new MT
          lando.cache.remove(`${app.name}.tooling.cache`);
        }))
        // Throw some sort of error
        // NOTE: this provides some error handling when we are completely non-interactive
        .catch(err => {
          throw (_.has(err, 'response.data')) ? new Error(err.response.data) : err;
        });
      });
    });

    // Add tokens and other meta to our app
    app.platformshTokenCache = 'platformsh.tokens';
    app.platformshTokens = lando.cache.get(app.platformshTokenCache) || [];
    app.terminusTokens = utils.getPlatformshTokens(lando.config.home);
  }
};
