'use strict';
const _ = require('lodash');
const PantheonApi = require('./lib/client');
const utils = require('./lib/utils');
const bootstrap = require("../../lib/bootstrap");
module.exports = lando => {
  // Add additional things to cleanse
  lando.log.alsoSanitize('pantheon-auth');
  lando.events.on('cli-answers', data => {
    if (
      _.get(data, 'options._app.recipe') === 'pantheon' &&
      ['pull', 'push', 'switch'].includes(_.first(_.get(data, 'options._', [])))
    ) {
      const cacheKey = _.get(data, 'options._app.metaCache');
      const meta = lando.cache.get(cacheKey);
      const cachedToken = _.get(meta, 'token', '');
      return new PantheonApi(cachedToken).auth()
        .catch((error) => {
          if (error.message.includes('failed with code 401')) {
            // Pull the bad token out of the metadata so it isn't used and prompts user for new token.
            // @todo: Do we want to actually delete the key instead of setting to null?
            meta.token = null;
            lando.cache.set(cacheKey, meta, {persist: true});

            // // Remove the bad token from the global token cache.
            // const globalTokens = lando.cache.get('pantheon.tokens');
            // const filteredTokens = _.filter(
            //   globalTokens,
            //   token => {
            //     return _.get(token, 'token', '') !== cachedToken;
            //   }
            // );
            // lando.cache.set('pantheon.tokens', [], {persist: true});
            // lando.cache.remove(_.get(data, 'options._app.toolingCache'));
          }
        });
    }
  });
};
