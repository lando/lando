/**
 * Pantheon init method
 *
 * @name init
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var api = require('./client')(lando);

  // "Constants"
  var tokenCacheKey = 'init:auth:pantheon:tokens';

  /*
   * Helper to determine whether we should ask the questions or not
   */
  var askQuestions = function(answers) {

    // Get our things
    var method = lando.tasks.argv()._[2];
    var recipe = answers.recipe;

    // return
    return (method === 'pantheon') || (recipe === 'pantheon');

  };

  /*
   * Helper to get pantheon accounts
   */
  var pantheonAccounts = function() {

    // Start an account collector
    var accounts = [];

    // Get our list of tokens
    _.forEach(lando.cache.get(tokenCacheKey), function(token, name) {
      accounts.push({name: name, value: token});
    });

    // Add option to add another token if we have accounts
    if (!_.isEmpty(accounts)) {
      accounts.push({name: 'add a different token', value: 'more'});
    }

    // Return choices
    return accounts;

  };

  // List of additional options
  var options = {
    'pantheon-auth': {
      describe: 'Pantheon machine token or email of previously used token',
      string: true,
      interactive: {
        type: 'list',
        message: 'Choose a Pantheon account',
        choices: pantheonAccounts(),
        when: function(answers) {
          return !_.isEmpty(pantheonAccounts()) && askQuestions(answers);
        },
        weight: 600
      }
    },
    'pantheon-auth-machine-token': {
      interactive: {
        name: 'pantheon-auth',
        type: 'password',
        message: 'Enter a Pantheon machine token',
        when: function(answers) {
          var token = _.get(answers, 'pantheon-auth');
          return (!token || token === 'more') && askQuestions(answers);
        },
        weight: 601
      }
    },
    'pantheon-site': {
      describe: 'Pantheon site machine name',
      string: true,
      interactive: {
        type: 'list',
        message: 'Which site?',
        choices: function(answers) {

          // Token path
          var tpath = 'pantheon-auth';

          // Make this async cause we need to hit the terminus
          var done = this.async();

          // Get the pantheon sites using the token
          api.getSites(_.get(lando.tasks.argv(), tpath, answers[tpath]))

          // Parse the sites into choices
          .map(function(site) {
            return {name: site.name, value: site.name};
          })

          // Done
          .then(function(sites) {
            done(null, sites);
          });

        },
        when: function(answers) {
          return askQuestions(answers);
        },
        weight: 602
      }
    }
  };

  /**
   * Build out pantheon recipe
   */
  var build = function() {

    // Return the things
    return {};

  };

  /*
   * Determine whether we need to show the recipe question or not
   */
  var when = function(answers) {

    // Set some things
    answers.recipe = 'pantheon';

    // return
    return false;

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
      config.config.env = 'dev';
      config.config.site = _.get(site[0], 'name', config.name);
      config.config.id = _.get(site[0], 'id', 'lando');

      // Return it
      return config;

    });

  };

  // Return the things
  return {
    build: build,
    options: options,
    whenRecipe: when,
    whenWebRoot: when,
    yaml: yaml
  };

};
