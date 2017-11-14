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
  var fs = lando.node.fs;
  var path = require('path');
  var Promise = lando.Promise;
  var url = require('url');

  // "Constants"
  var tokenCacheKey = 'init:auth:pantheon:tokens';
  var siteMetaDataKey = 'site:meta:';

  /*
   * Modify init pre-prompt things
   */
  lando.events.on('task-init-answers', function(answers) {
    if (answers.argv.method === 'pantheon') {

      // Autoset the recipe
      answers.argv.recipe = 'pantheon';

      // Remove the webroot and name question
      _.remove(answers.inquirer, function(question) {
        return question.name === 'webroot' || question.name === 'name';
      });

    }
  });

  /*
   * Modify init pre-run things
   */
  lando.events.on('task-init-run', 1, function(answers) {
    if (answers.method === 'pantheon' || answers.recipe === 'pantheon') {

      // Set name if unset at this point, which it should be unless flagged in.
      if (answers.name === undefined) {
        answers.name = _.get(answers, 'pantheon-site', 'lando-app');
      }

    }
  });

  /*
   * Helper to determine whether we should ask the questions or not
   */
  var askQuestions = function(answers) {

    // Get our things
    var method = lando.tasks.argv()._[1];
    var recipe = answers.recipe || lando.tasks.argv().recipe;

    // return
    return (method === 'pantheon') || (recipe === 'pantheon');

  };

  /*
   * Helper to get pantheon accounts
   */
  var pantheonAccounts = function() {

    // Get some paths
    var homeDir = lando.config.home;
    var tokenDir = path.join(homeDir, '.terminus', 'cache', 'tokens');

    // Start account collectors
    var accounts = [];

    // Get our list of tokens
    _.forEach(lando.cache.get(tokenCacheKey), function(token, name) {
      accounts.push({name: name, value: token});
    });

    // Mixin preexisting tokenss
    if (fs.existsSync(tokenDir)) {
      _.forEach(fs.readdirSync(tokenDir), function(token) {
        var dataPath = path.join(tokenDir, token);
        var data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        if (_.isEmpty(_.find(accounts, ['name', data.email]))) {
          accounts.push({name: data.email, value: data.token});
        }
      });
    }

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
  var build = function(name, options) {

    // Set some things up
    var dest = options.destination;
    var key = 'pantheon.lando.id_rsa';

    // Check if directory is non-empty
    if (!_.isEmpty(fs.readdirSync(dest))) {
      lando.log.error('Directory %s must be empty to Pantheon init.', dest);
      process.exit(1);
    }

    // Check if ssh key exists and create if not
    return Promise.try(function() {
      if (!fs.existsSync(path.join(lando.config.userConfRoot, 'keys', key))) {
        lando.log.verbose('Creating key %s for Pantheon', key);
        return lando.init.run(name, dest, lando.init.createKey(key));
      }
      else {
        lando.log.verbose('Key %s exists for Pantheon', key);
      }
    })

    // Refresh and set keys
    .then(function() {
      return lando.init.run(name, dest, '/load-keys.sh', 'root');
    })

    // Post SSH key to pantheon
    .then(function() {
      return api.postKey(_.get(options, 'pantheon-auth'));
    })

    // Git clone the project
    .then(function() {

      // Let's get our sites
      return api.getSites(_.get(options, 'pantheon-auth'))

      // Get our site
      .filter(function(site) {
        return site.name === _.get(options, 'pantheon-site');
      })

      // Git clone
      .then(function(site) {

        // Error if no site was found, this is mostly for non-interactive things
        if (_.isEmpty(site)) {
          var badSite = _.get(options, 'pantheon-site');
          lando.log.error('%s does not appear to be a valid site!', badSite);
          process.exit(1222);
        }

        // Build the clone url
        var user = 'codeserver.dev.' + site[0].id;
        var hostname = user + '.drush.in';
        var port = '2222';
        var gitUrl = {
          auth: user,
          protocol: 'ssh:',
          slashes: true,
          hostname: hostname,
          port: port,
          pathname: '/~/repository.git'
        };

        // Clone cmd
        var cmd = [
          'cd $LANDO_MOUNT',
          'git clone ' + url.format(gitUrl) + ' ./'
        ].join(' && ');

        // Clone
        return lando.init.run(name, dest, cmd);

      });

    });

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
      lando.cache.set(siteMetaDataKey + options.name, data, {persist: true});

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
