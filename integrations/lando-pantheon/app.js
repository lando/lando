'use strict';

// Modules
const _ = require('lodash');
const PantheonApiClient = require('./lib/client');
const utils = require('./lib/utils');

module.exports = (app, lando) => {
  // Add additional things to cleanse
  app.log.alsoSanitize('pantheon-auth');

  // Only do this on pantheon recipes
  if (_.get(app, 'config.recipe') === 'pantheon') {
    // Set the app caches, validate tokens and update token cache
    _.forEach(['pull', 'push', 'switch'], command => {
      app.events.on(`post-${command}`, (config, answers) => {
        // Only run if answer.auth is set, this allows these commands to all be
        // overriden without causing a failure here
        if (answers.auth) {
         const api = new PantheonApiClient(answers.auth, app.log);
          return api.auth().then(() => api.getUser().then(results => {
            const cache = {token: answers.auth, email: results.email, date: _.toInteger(_.now() / 1000)};
            // Reset this apps metacache
            lando.cache.set(app.metaCache, _.merge({}, app.meta, cache), {persist: true});
            // Set lando's store of pantheon machine tokens
            lando.cache.set(app.pantheonTokenCache, utils.sortTokens(app.pantheonTokens, [cache]), {persist: true});
            // Wipe out the apps tooling cache to reset with the new MT
            lando.cache.remove(`${app.name}.tooling.cache`);
          }))
          // Throw some sort of error
          // NOTE: this provides some error handling when we are completely non-interactive
          .catch(err => {
            throw (_.has(err, 'response.data')) ? new Error(err.response.data) : err;
          });
        }
      });
    });

    // Load in other stuff like tokens and other meta at the most opportune moment
    app.events.on('pre-init', 1, () => {
      app.pantheonTokenCache = 'pantheon.tokens';
      app.pantheonTokens = lando.cache.get(app.pantheonTokenCache) || [];
      app.terminusTokens = utils.getTerminusTokens(lando.config.home);
    });
  }
};
