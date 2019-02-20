'use strict';

// Modules
const _ = require('lodash');
const PantheonApiClient = require('./lib/client');
const utils = require('./lib/utils');

module.exports = (app, lando) => {
  // Only do this on pantheon recipes
  if (_.get(app, 'config.recipe') === 'pantheon') {
    // Add tokens and other meta to our app
    app.pantheonTokenCache = 'pantheon.tokens';
    app.pantheonTokens = lando.cache.get(app.pantheonTokenCache) || [];
    app.terminusTokens = utils.getTerminusTokens(lando.config.home);
    console.log(app.metaCache)
    console.log(app.meta)
    console.log(app.pantheonTokenCache)
    // Set the app caches, validate tokens and update token cache
    _.forEach(['pull', 'push', 'switch'], command => {
      lando.events.on(`cli-${command}-run`, data => {
        const api = new PantheonApiClient(data.options.auth, app.log);
        return api.auth().then(() => api.getUser().then(results => {
          const cache = {token: data.options.auth, email: results.email, date: _.toInteger(_.now() / 1000)};
          // Reset this apps metacache
          lando.cache.set(app.metaCache, _.merge({}, app.meta, cache), {persist: true});
          // Set lando's store of pantheon machine tokens
          lando.cache.set(app.pantheonTokenCache, utils.sortTokens(app.pantheonTokens, [cache]), {persist: true});
        }))
        // Throw some sort of error
        // NOTE: this provides some error handling when we are completely non-interactive
        .catch(err => {
          throw (_.has(err, 'response.data')) ? new Error(err.response.data) : err;
        });
      });
    });
  }
};
