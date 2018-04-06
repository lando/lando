'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var api = require('./client')(lando);
  var fs = lando.node.fs;
  var path = require('path');
  var Promise = lando.Promise;
  var url = require('url');

  // List of additional options
  var options = {

  };

  /*
   * Build out pantheon recipe
   */
  var build = function(name, options) {


  };

  /*
   * Helper to mix in other pantheon options
   */
  var yaml = function(config, options) {

    // Let's get our sites
    return api.getSites(_.get(options, 'pantheon-auth'))

    // Filter out our site
    .filter(function(site) {
      return site.name === _.get(options, 'pantheon-site');
    })

    // Set the config
    .then(function(site) {

      // Augment the config
      config.config = {};
      config.config.framework = _.get(site[0], 'framework', 'drupal');
      config.config.site = _.get(site[0], 'name', config.name);
      config.config.id = _.get(site[0], 'id', 'lando');

      // Set some cached things as well
      var token = _.get(options, 'pantheon-auth');
      var tokens = lando.cache.get(tokenCacheKey);
      var email = '';

      // Check to see if our "token" is actually an email
      if (_.includes(_.keys(tokens), token)) {
        email = token;
        token = tokens[email];
      }

      // If not, do it nasty
      else {
        email = _.findKey(tokens, function(value) {
          return value === token;
        });
      }

      // Set and cache the TOKENZZZZ
      var data = {email: email, token: token};
      var name = lando.utils.engine.dockerComposify(options.appname);
      lando.cache.set(siteMetaDataKey + name, data, {persist: true});

      // Return it
      return config;

    });

  };

  // Return the things
  return {
    build: build,
    options: options,
    yaml: yaml
  };

};
