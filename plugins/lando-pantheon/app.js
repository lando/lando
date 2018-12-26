'use strict';

// Modules

module.exports = (app, lando) => {};

/*
// Load in our init method
  lando.init.add('pantheon', require('./init')(lando));

  // Modules
  const _ = lando.node._;

  // Lando things
  const PantheonApiClient = require('./client');
  const api = new PantheonApiClient(lando.log);

  lando.events.on('post-instantiate-app', app => {
    // Cache key helpers
    const siteMetaDataKey = 'site.meta.';

    // Set new terminus key into the cache
    app.events.on('pre-terminus', () => {
      if (_.get(lando.cli.argv()._, '[1]') === 'auth:login') {
        if (_.has(lando.cli.argv(), 'machineToken')) {
          // Build the cache
          // @TODO: what do do about email?
          const token = _.get(lando.cli.argv(), 'machineToken');
          const data = {token: token};

          // Mix in any existing cache data
          if (!_.isEmpty(lando.cache.get(siteMetaDataKey + app.name))) {
            data = _.merge(lando.cache.get(siteMetaDataKey + app.name), data);
          }

          // Reset the cache
          lando.cache.set(siteMetaDataKey + app.name, data, {persist: true});
        }
      }
    });

    // Destroy the cached site data
    app.events.on('post-destroy', () => {
      lando.cache.remove(siteMetaDataKey + app.name);
    });
  });

  const getEnvs = (done, nopes) => {
    // Envs to remove
    const restricted = nopes || [];

    // Get token
    const token = _.get(lando.cache.get('site.meta.' + config._app), 'token');

    // If token does not exist prmpt for auth
    if (_.isEmpty(token)) {
      lando.log.error('Looks like you dont have a machine token!');
      throw new Error('Run lando terminus auth:login --machine-token=TOKEN');
    }

    // Validate we have a token and siteid
    _.forEach([token, config.id], prop => {
      if (_.isEmpty(prop)) {
        lando.log.error('Error getting token or siteid.', prop);
        throw new Error('Make sure you run: lando init pantheon');
      }
    });

    // Get the pantheon sites using the token
    api.auth(token).then(authorizedApi => authorizedApi.getSiteEnvs(config.id))

    // Parse the evns into choices
    .map(env => ({name: env.id, value: env.id}))

    // Filter out any restricted envs
    .filter(env => !_.includes(restricted, env.value))

    // Done
    .then(envs => {
      envs.push({name: 'none', value: 'none'});
      done(null, envs);
    });
  };

*/

