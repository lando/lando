'use strict';

// Modules
const _ = require('lodash');
const API = require('./lib/api');
const utils = require('./lib/utils');

module.exports = (app, lando) => {
  // Add additional things to cleanse
  app.log.alsoSanitize('acquia-auth');
  app.log.alsoSanitize('acquia-key');

  // Only do this on acquia recipes
  if (_.get(app, 'config.recipe') === 'acquia') {
    // Set the app caches, validate keys and update token keys
    _.forEach(['pull', 'push'], command => {
      app.events.on(`post-${command}`, (config, answers) => {
        // Only run if answer.auth is set, this allows these commands to all be
        // overriden without causing a failure here
        if (answers.key && answers.secret) {
          const api = new API();
          return api.auth(answers.key, answers.secret, true, true)
            .then(() => api.getAccount())
            .then(account => {
              // This is good auth, lets update our cache
              const cache = {key: answers.key, label: account.mail, secret: answers.secret};
              // Reset this apps metacache
              lando.cache.set(app.metaCache, _.merge({}, app.meta, cache), {persist: true});
              // Reset the acquia key cache
              const keys = utils.sortKeys(app.acquiaKeys, app.hostKeys, [cache]);
              lando.cache.set(app.acquiaKeyCache, keys, {persist: true});
              // Blow away tooling cache so we can reset our pull commands
              lando.cache.remove(`${app.name}.tooling.cache`);
            })
            // Throw some sort of error
            // NOTE: this provides some error handling when we are completely non-interactive
            .catch(err => {
              throw (_.has(err, 'response.data')) ? new Error(err.response.data) : err;
            });
        }
      });
    });

    app.events.on('pre-init', 1, () => {
      app.acquiaKeyCache = 'acquia.keys';
      app.acquiaKeys = lando.cache.get(app.acquiaKeyCache) || [];
      app.hostKeys = utils.getHostKeys(lando.config.home) || [];
    });
  }
};
