``'use strict';

const _ = require('lodash');
const PantheonApi = require('./lib/client');

const removeInvalidGlobalTokens = (lando, cachedToken) => {
  const globalTokens = lando.cache.get('pantheon.tokens');
  const filteredTokens = _(globalTokens)
    .filter(token => token.token !== cachedToken)
    .value();
  lando.cache.set('pantheon.tokens', filteredTokens, {persist: true});
};

const clearInvalidTokenFromToolingCache = (lando, cacheKey, meta, data) => {
  lando.cache.set(cacheKey, _.omit(meta, ['token']), {persist: true});
  lando.cache.remove(_.get(data, 'options._app.toolingCache'));
  lando.cli.clearTaskCaches();
};

const errorIs401 = error => error.message.includes('failed with code 401');

const checkTokens = (lando, command) => {
  lando.events.on(`cli-${command}-answers`, data => {
    if (_.get(data, 'options._app.recipe') === 'pantheon') {
      // Gather the things we need
      const cacheKey = _.get(data, 'options._app.metaCache');
      const meta = lando.cache.get(cacheKey);
      const cachedToken = _.get(meta, 'token', null);

      if (!_.isEmpty(cachedToken)) {
        // Make sure our token is good beforehand
        return new PantheonApi(cachedToken, lando.log).auth().catch(error => {
          if (errorIs401(error)) {
            // Remove the bad token from the global token cache.
            removeInvalidGlobalTokens(lando, cachedToken);
            // Set or things correctly for downstream
            clearInvalidTokenFromToolingCache(lando, cacheKey, meta, data);
            // This is the money option
            delete data.options.auth;
            console.log(lando.cli.makeArt('badToken'));
          }
        });
      }
    }
  });
};

module.exports = lando => {
  // Add additional things to cleanse
  lando.log.alsoSanitize('pantheon-auth');
  // Attempt to remove a revoked or bad app token so the user is prompted
  _.forEach(['pull', 'push', 'switch'], command => {
    checkTokens(lando, command);
  });
};
