'use strict';

module.exports = lando => {
  // Modules
  const _ = lando.node._;
  const fs = lando.node.fs;
  const GitHubApi = require('github');
  const path = require('path');
  const Promise = lando.Promise;

  // github
  const github = new GitHubApi({Promise: Promise});

  // "Constants"
  const tokenCacheKey = 'init.auth.github.tokens';
  const siteMetaDataKey = 'site.meta.';

  /*
   * Modify init pre-prompt things
   */
  lando.events.on('task-init-answers', answers => {
    if (answers.argv.method === 'github') {
      _.remove(answers.inquirer, question => question.name === 'name');
    }
  });

  /*
   * Modify init pre-run things
   */
  lando.events.on('task-init-run', answers => {
    if (answers.method === 'github') {
      // Set name if unset at this point, which it should be unless flagged in.
      if (answers.name === undefined) {
        // Get and set the name
        const repoUrl = _.get(answers, 'github-repo', 'l/lando-app.git');
        const gitUrl = repoUrl.split('/')[1];
        answers.name = gitUrl.split('.')[0];
      }
    }
  });

  /*
   * Helper to determine whether we should ask the questions or not
   */
  const askQuestions = answers => {
    // Get our things
    const method = lando.cli.argv()._[1];
    const recipe = answers.recipe;
    // return
    return (method === 'github') || (recipe === 'github');
  };

  /*
   * Helper to get pantheon accounts
   */
  const gitHubAccounts = () => {
    // Start account collectors
    const accounts = [];

    // Get our list of tokens
    _.forEach(lando.cache.get(tokenCacheKey), (token, name) => {
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
  const options = {
    'github-auth': {
      describe: 'GitHub token or email of previously used token',
      string: true,
      interactive: {
        type: 'list',
        message: 'Choose a GitHub account',
        choices: gitHubAccounts(),
        when: answers => !_.isEmpty(gitHubAccounts()) && askQuestions(answers),
        weight: 400,
      },
    },
    'github-auth-token': {
      interactive: {
        name: 'github-auth',
        type: 'password',
        message: 'Enter a GitHub token',
        when: answers => {
          const token = _.get(answers, 'github-auth');
          return (!token || token === 'more') && askQuestions(answers);
        },
        weight: 401,
      },
    },
    'github-repo': {
      describe: 'GitHub repo URL',
      string: true,
      interactive: {
        type: 'list',
        message: 'Which site?',
        choices: function(answers) {
          // Repo collector
          const repos = [];

          // Spin things up
          const tpath = 'github-auth';
          const token = _.get(lando.cli.argv(), tpath, answers[tpath]);
          const options = {affliation: 'owner,collaborator', per_page: 100};
          const done = this.async();

          // Check to see if token is cached already and use that
          const tokens = lando.cache.get(tokenCacheKey) || {};
          if (_.includes(_.keys(tokens), token)) {
            token = tokens[token];
          }

          /*
           * Helper to resursively load all our repos
           */
          const getAllRepos = (err, res) => {
            // Error
            if (err) {
              lando.log.error('Problem getting sites from GitHub');
            }

            // Add previous data to current
            repos = repos.concat(res.data);

            // IF we have more pages lets add them
            if (github.hasNextPage(res)) {
              github.getNextPage(res, getAllRepos);
            } else {
              done(null, _.map(repos, function(site) {
                const name = _.get(site, 'full_name');
                const value = _.get(site, 'ssh_url');
                return {name: name, value: value};
              }));
            }
          };

          // Start the github authchain
          github.authenticate({type: 'token', token: token});

          // Get all our sites
          github.repos.getAll(options, getAllRepos);
        },
        when: answers => askQuestions(answers),
        weight: 402,
      },
    },
  };

  /*
   * Build out github method
   */
  const build = (name, options) => {
    // Set some things up
    const dest = options.destination;
    const key = 'github.lando.id_rsa';
    const token = _.get(options, 'github-auth');
    const tokens = lando.cache.get(tokenCacheKey) || {};
    const repo = _.get(options, 'github-repo');

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
    return Promise.try(() => {
      if (!fs.existsSync(path.join(lando.config.userConfRoot, 'keys', key))) {
        lando.log.verbose('Creating key %s for GitHub', key);
        return lando.init.run(name, dest, lando.init.createKey(key));
      } else {
        lando.log.verbose('Key %s exists for GitHub', key);
      }
    })

    // Refresh keys
    .then(() => {
      return lando.init.run(name, dest, '/load-keys.sh', 'root');
    })

    // Post SSH key to github
    .then(() => {
      // Path to ssh key
      const keyPath = path.join(lando.config.userConfRoot, 'keys', key + '.pub');

      // Options for posting key
      return github.users.createKey({
        title: 'lando',
        key: _.trim(fs.readFileSync(keyPath, 'utf8')),
      })

      // Catch key already in use error
      .catch(err => {
        // Parse message
        const message = JSON.parse(err.message);

        // Report error for everything else
        if (_.has(message.errors, '[0].message')) {
          if (message.errors[0].message !== 'key is already in use') {
            lando.log.error(err);
          }
        }
      });
    })

    // Cache some relevant things
    .then(() => {
      // Get myself
      return github.users.get({})

      // Cache
      .then(user => {
        // Get email
        const email = _.get(user, 'data.email');

        // Check to see if token is cached already and use that
        tokens[email] = token;
        lando.cache.set(tokenCacheKey, tokens, {persist: true});

        // Cache the site things
        const data = {email: email};
        const dc = lando.utils.engine.dockerComposify;
        const siteKey = siteMetaDataKey + dc(name);
        lando.cache.set(siteKey, data, {persist: true});
      });
    })

    // Git clone the project
    .then(() => lando.init.run(name, dest, lando.init.cloneRepo(repo)));
  };

  /*
   * Helper to mix in other github options
   */
  const yaml = config => config;

  // Return the things
  return {
    build: build,
    options: options,
    yaml: yaml,
  };
};
