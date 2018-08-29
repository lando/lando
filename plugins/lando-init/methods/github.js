'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var fs = lando.node.fs;
  var GitHubApi = require('github');
  var path = require('path');
  var Promise = lando.Promise;

  // github
  var github = new GitHubApi({Promise: Promise});

  // "Constants"
  var tokenCacheKey = 'init.auth.github.tokens';
  var siteMetaDataKey = 'site.meta.';

  /*
   * Modify init pre-prompt things
   */
  lando.events.on('task-init-answers', function(answers) {
    if (answers.argv.method === 'github') {

      // Remove the name question
      _.remove(answers.inquirer, function(question) {
        return question.name === 'name';
      });

    }
  });

  /*
   * Modify init pre-run things
   */
  lando.events.on('task-init-run', function(answers) {
    if (answers.method === 'github') {

      // Set name if unset at this point, which it should be unless flagged in.
      if (answers.name === undefined) {

        // Get and set the name
        var repoUrl = _.get(answers, 'github-repo', 'l/lando-app.git');
        var gitUrl = repoUrl.split('/')[1];
        answers.name = gitUrl.split('.')[0];

      }

    }
  });

  /*
   * Helper to determine whether we should ask the questions or not
   */
  var askQuestions = function(answers) {

    // Get our things
    var method = lando.cli.argv()._[1];
    var recipe = answers.recipe;

    // return
    return (method === 'github') || (recipe === 'github');

  };

  /*
   * Helper to get pantheon accounts
   */
  var gitHubAccounts = function() {

    // Start account collectors
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
    'github-auth': {
      describe: 'GitHub token or email of previously used token',
      string: true,
      interactive: {
        type: 'list',
        message: 'Choose a GitHub account',
        choices: gitHubAccounts(),
        when: function(answers) {
          return !_.isEmpty(gitHubAccounts()) && askQuestions(answers);
        },
        weight: 400
      }
    },
    'github-auth-token': {
      interactive: {
        name: 'github-auth',
        type: 'password',
        message: 'Enter a GitHub token',
        when: function(answers) {
          var token = _.get(answers, 'github-auth');
          return (!token || token === 'more') && askQuestions(answers);
        },
        weight: 401
      }
    },
    'github-repo': {
      describe: 'GitHub repo URL',
      string: true,
      interactive: {
        type: 'list',
        message: 'Which site?',
        choices: function(answers) {

          // Repo collector
          var repos = [];

          // Spin things up
          var tpath = 'github-auth';
          var token = _.get(lando.cli.argv(), tpath, answers[tpath]);
          var options = {affliation: 'owner,collaborator', 'per_page': 100};
          var done = this.async();

          // Check to see if token is cached already and use that
          var tokens = lando.cache.get(tokenCacheKey) || {};
          if (_.includes(_.keys(tokens), token)) {
            token = tokens[token];
          }

          /*
           * Helper to resursively load all our repos
           */
          var getAllRepos = function(err, res) {

            // Error
            if (err) {
              lando.log.error('Problem getting sites from GitHub');
            }

            // Add previous data to current
            repos = repos.concat(res.data);

            // IF we have more pages lets add them
            if (github.hasNextPage(res)) {
              github.getNextPage(res, getAllRepos);
            }

            // Otherwise lets send back our result
            else {
              done(null, _.map(repos, function(site) {
                var name =  _.get(site, 'full_name');
                var value =  _.get(site, 'ssh_url');
                return {name: name, value: value};
              }));
            }

          };

          // Start the github authchain
          github.authenticate({type: 'token', token: token});

          // Get all our sites
          github.repos.getAll(options, getAllRepos);

        },
        when: function(answers) {
          return askQuestions(answers);
        },
        weight: 402
      }
    }
  };

  /*
   * Build out github method
   */
  var build = function(name, options) {

    // Set some things up
    var dest = options.destination;
    var key = 'github.lando.id_rsa';
    var token = _.get(options, 'github-auth');
    var tokens = lando.cache.get(tokenCacheKey) || {};
    var repo = _.get(options, 'github-repo');

    // Check to see if token is cached already and use that
    if (_.includes(_.keys(tokens), token)) {
      token = tokens[token];
    }

    // Start the github authchain
    github.authenticate({type: 'token', token: token});

    // Check if directory is non-empty
    if (!_.isEmpty(fs.readdirSync(dest))) {
      throw new Error('Directory must be empty to GitHub init.');
    }

    // Check if ssh key exists and create if not
    return Promise.try(function() {
      if (!fs.existsSync(path.join(lando.config.userConfRoot, 'keys', key))) {
        lando.log.verbose('Creating key %s for GitHub', key);
        return lando.init.run(name, dest, lando.init.createKey(key));
      }
      else {
        lando.log.verbose('Key %s exists for GitHub', key);
      }
    })

    // Refresh keys
    .then(function() {
      return lando.init.run(name, dest, '/load-keys.sh', 'root');
    })

    // Post SSH key to github
    .then(function() {

      // Path to ssh key
      var keyPath = path.join(lando.config.userConfRoot, 'keys', key + '.pub');

      // Options for posting key
      return github.users.createKey({
        title: 'lando',
        key: _.trim(fs.readFileSync(keyPath, 'utf8'))
      })

      // Catch key already in use error
      .catch(function(err) {

        // Parse message
        var message = JSON.parse(err.message);

        // Report error for everything else
        if (_.has(message.errors, '[0].message')) {
          if (message.errors[0].message !== 'key is already in use') {
            lando.log.error(err);
          }
        }

      });

    })

    // Cache some relevant things
    .then(function() {

      // Get myself
      return github.users.get({})

      // Cache
      .then(function(user) {

        // Get email
        var email = _.get(user, 'data.email');

        // Check to see if token is cached already and use that
        tokens[email] = token;
        lando.cache.set(tokenCacheKey, tokens, {persist: true});

        // Cache the site things
        var data = {email: email};
        var dc = lando.utils.engine.dockerComposify;
        var siteKey = siteMetaDataKey + dc(name);
        lando.cache.set(siteKey, data, {persist: true});

      });

    })

    // Git clone the project
    .then(function() {
      return lando.init.run(name, dest, lando.init.cloneRepo(repo));
    });

  };

  /*
   * Helper to mix in other github options
   */
  var yaml = function(config) {
    return config;
  };

  // Return the things
  return {
    build: build,
    options: options,
    yaml: yaml
  };

};
