'use strict';

module.exports = lando => {
  // Modules
  const _ = lando.node._;
  const PantheonApiClient = require('./client');
  const api = new PantheonApiClient(lando.log);
  const fs = lando.node.fs;
  const path = require('path');
  const Promise = lando.Promise;
  const url = require('url');

  // "Constants"
  const tokenCacheKey = 'init.auth.pantheon.tokens';
  const siteMetaDataKey = 'site.meta.';

  /*
   * Modify init pre-prompt things
   */
  lando.events.on('task-init-answers', answers => {
    if (answers.argv.method === 'pantheon') {
      // Autoset the recipe
      answers.argv.recipe = 'pantheon';

      // Remove the webroot and name question
      _.remove(answers.inquirer, question => {
        return question.name === 'webroot' || question.name === 'name';
      });
    }
  });

  /*
   * Modify init pre-run things
   */
  lando.events.on('task-init-run', 1, answers => {
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
  const askQuestions = answers => {
    // Get our things
    const method = lando.cli.argv()._[1];
    const recipe = answers.recipe || lando.cli.argv().recipe;

    // return
    return (method === 'pantheon') || (recipe === 'pantheon');
  };

  /*
   * Helper to get pantheon accounts
   */
  const pantheonAccounts = () => {
    // Get some paths
    const homeDir = lando.config.home;
    const tokenDir = path.join(homeDir, '.terminus', 'cache', 'tokens');

    // Start account collectors
    const accounts = [];

    // Get our list of tokens
    _.forEach(lando.cache.get(tokenCacheKey), (token, name) => {
      accounts.push({name: name, value: token});
    });

    // Mixin preexisting tokenss
    if (fs.existsSync(tokenDir)) {
      _.forEach(fs.readdirSync(tokenDir), token => {
        const dataPath = path.join(tokenDir, token);
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
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
  const options = {
    'pantheon-auth': {
      describe: 'Pantheon machine token or email of previously used token',
      string: true,
      interactive: {
        type: 'list',
        message: 'Choose a Pantheon account',
        choices: pantheonAccounts(),
        when: answers => !_.isEmpty(pantheonAccounts()) && askQuestions(answers),
        weight: 600,
      },
    },
    'pantheon-auth-machine-token': {
      interactive: {
        name: 'pantheon-auth',
        type: 'password',
        message: 'Enter a Pantheon machine token',
        when: answers => _.isEmpty(pantheonAccounts())
          || (_.get(answers, 'pantheon-auth', '') === 'more') && askQuestions(answers),
        weight: 601,
      },
    },
    'pantheon-site': {
      describe: 'Pantheon site machine name',
      string: true,
      interactive: {
        type: 'list',
        message: 'Which site?',
        choices: function(answers) {
          // Token path
          const tpath = 'pantheon-auth';
          // Make this async cause we need to hit the terminus
          const done = this.async();
          // Get the pantheon sites using the token
          api.auth(_.get(lando.cli.argv(), tpath, answers[tpath]))
          // Parse the sites into choices
          .then(authorizedApi => authorizedApi.getSites())
          // Parse the sites into choices
          .map(site => ({name: site.name, value: site.name}))
          // Done
          .then(sites => done(null, sites));
        },
        when: answers => askQuestions(answers),
        weight: 602,
      },
    },
  };

  /*
   * Build out pantheon recipe
   */
  const build = (name, options) => {
    // Set some things up
    const dest = options.destination;
    const key = path.join(lando.config.userConfRoot, 'keys', 'pantheon.lando.id_rsa');
    const pubKey = key + '.pub';
    const token = _.get(options, 'pantheon-auth');

    // Check if directory is non-empty
    if (!_.isEmpty(fs.readdirSync(dest))) {
      throw new Error('Directory must be empty to Pantheon init.');
    }

    // Check if ssh key exists and create if not
    return Promise.try(() => {
      if (!fs.existsSync(key)) {
        lando.log.verbose('Creating key %s for Pantheon', key);
        return lando.init.run(name, dest, lando.init.createKey(path.basename(key)));
      } else {
        lando.log.verbose('Key %s exists for Pantheon', key);
      }
    })

    // Refresh and set keys
    .then(() => lando.init.run(name, dest, '/load-keys.sh', 'root'))

    // Post SSH key to pantheon
    .then(() => api.auth(token).then(authorizedApi => authorizedApi.postKey(pubKey)))

    // Git clone the project
    .then(() => {
      // Let's get our sites
      return api.auth(token).then(authorizedApi => authorizedApi.getSites())

      // Get our site
      .filter(site => site.name === _.get(options, 'pantheon-site'))

      // Git clone
      .then(site => {
        // Error if no site was found, this is mostly for non-interactive things
        if (_.isEmpty(site)) {
          throw new Error('This does not appear to be a valid site!');
        }

        // Build the clone url
        const user = 'codeserver.dev.' + site[0].id;
        const hostname = user + '.drush.in';
        const port = '2222';
        const gitUrl = {
          auth: user,
          protocol: 'ssh:',
          slashes: true,
          hostname: hostname,
          port: port,
          pathname: '/~/repository.git',
        };

        // Repo
        const repo = url.format(gitUrl);

        // Clone
        return lando.init.run(name, dest, lando.init.cloneRepo(repo));
      });
    });
  };

  /*
   * Helper to mix in other pantheon options
   */
  const yaml = (config, options) => {
    // Let's get our sites and user data
    return api.auth(_.get(options, 'pantheon-auth')).then(authorizedApi => Promise.all([
      authorizedApi.getSites(),
      authorizedApi.getUser(),
    ]))

    // Set the config
    .then(results => {
      // Get our site and email
      const site = _.head(_.filter(results[0], site => site.name === _.get(options, 'pantheon-site')));

      // Error if site doesnt exist
      if (_.isEmpty(site)) {
        throw Error('No such pantheon site!');
      }

      // Set our tokens
      const token = _.get(options, 'pantheon-auth');
      const tokens = lando.cache.get(tokenCacheKey) || {};
      const email = _.get(results[1], 'email');
      tokens[email] = token;
      lando.cache.set(tokenCacheKey, tokens, {persist: true});

      // Augment the config
      config.config = {};
      config.config.framework = _.get(site, 'framework', 'drupal');
      config.config.site = _.get(site, 'name', config.name);
      config.config.id = _.get(site, 'id', 'lando');

      // And site meta-data
      const data = {email: email, token: token};
      const name = lando.utils.engine.dockerComposify(config.config.site);
      lando.cache.set(siteMetaDataKey + name, data, {persist: true});

      // Return it
      return config;
    });
  };

  // Return the things
  return {
    build: build,
    options: options,
    yaml: yaml,
  };
};
