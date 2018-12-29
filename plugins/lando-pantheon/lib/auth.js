'use strict';

// Modules
const PantheonApiClient = require('./client');
const api = new PantheonApiClient(lando.log);
const path = require('path');
const url = require('url');

// "Constants"
const tokenCacheKey = 'init.auth.pantheon.tokens';
const siteMetaDataKey = 'site.meta.';

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
};


