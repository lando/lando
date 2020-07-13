'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const GitHubApi = require('github');
const os = require('os');
const path = require('path');
const Promise = require('./../../../lib/promise');

// Github
const github = new GitHubApi({Promise: Promise});
const githubTokenCache = 'github.tokens';
const gitHubLandoKey = 'github.lando.id_rsa';
const gitHubLandoKeyComment = 'lando@' + os.hostname();
let gitHubRepos = [];

// Helper to sort tokens
const sortTokens = (...sources) => _(_.flatten([...sources]))
  .sortBy('date')
  .groupBy('user')
  .map(tokens => _.last(tokens))
  .value();

// Heloer to throw an error
const throwError = err => `${err.code} ${err.status} ${err.message}`;

// Helper to retrieve all github repoz
const getAllRepos = (resolve, reject, slugs = []) => (err, res) => {
  // resolve([{name: 'seseg'}])
  if (err) reject(err);
  // Add previous data to current
  slugs = slugs.concat(_.map(res.data, site => ({name: site.full_name, value: site.ssh_url})));
  // IF we have more pages lets add them
  if (github.hasNextPage(res)) {
    return github.getNextPage(res, getAllRepos(resolve, reject, slugs));
  // Return if we are done
  } else {
    resolve(_.sortBy(slugs, 'name'));
  }
};

// Helper to get github tokens
const getTokens = tokens => _(tokens)
  .map(token => ({name: token.user, value: token.token}))
  .value();

// Helper to parse tokens into choices
const parseTokens = tokens => _.flatten([getTokens(tokens), [{name: 'add or refresh a token', value: 'more'}]]);

// Helper to post a github ssh key
const postKey = (keyDir, token) => {
  // Auth
  github.authenticate({type: 'token', token});
  // Post key
  return github.users.createKey({
    title: 'lando',
    key: _.trim(fs.readFileSync(path.join(keyDir, `${gitHubLandoKey}.pub`), 'utf8')),
  })
  // Catch key already in use error
  .catch(err => {
    const message = JSON.parse(err.message);
    // Report error for everything else
    if (_.has(message.errors, '[0].message') && message.errors[0].message !== 'key is already in use') {
      throw Error(throwError(err));
    }
  });
};

// Helper to set caches
const setCaches = (options, lando) => {
  // Get the github user
  github.authenticate({type: 'token', token: options['github-auth']});
  return github.users.get({})
  .then(user => {
    // Reset this apps metacache
    const metaData = lando.cache.get(`${options.name}.meta.cache`) || {};
    lando.cache.set(`${options.name}.meta.cache`, _.merge({}, metaData, {email: user.data.email}), {persist: true});
    // Reset github tokens
    const tokens = lando.cache.get(githubTokenCache) || [];
    const cache = {token: options['github-auth'], user: user.data.login, date: _.toInteger(_.now() / 1000)};
    lando.cache.set(githubTokenCache, sortTokens(tokens, [cache]), {persist: true});
  });
};

// Helper to determine whether to show list of pre-used tokens or not
const showTokenList = (source, tokens = []) => !_.isEmpty(tokens) && source === 'github';

// Helper to determine whether to show token password entry or not
const showTokenEntry = (source, answer, tkez = []) => ((_.isEmpty(tkez) || answer === 'more')) && source === 'github';

// Helper to get list of github projects
const getRepos = (answers, Promise) => {
  // Log
  console.log('Getting your GitHub repos... this may take a moment if you have a lot');
  return new Promise((resolve, reject) => {
    // Authenticate
    github.authenticate({type: 'token', token: answers['github-auth']});
    // Get all our slguzz
    github.repos.getAll({affliation: 'owner,collaborator', per_page: 100}, getAllRepos(resolve, reject));
  });
};

// Helper to get sites for autocomplete
const getAutoCompleteRepos = (answers, Promise, input = null) => {
  if (!_.isEmpty(gitHubRepos)) {
    return Promise.resolve(gitHubRepos).filter(site => _.startsWith(site.name, input));
  } else {
    return getRepos(answers, Promise).then(sites => {
      gitHubRepos = sites;
      return gitHubRepos;
    });
  };
};

module.exports = {
  sources: [{
    name: 'github',
    label: 'github',
    options: lando => ({
      'github-auth': {
        describe: 'A GitHub personal access token',
        string: true,
        interactive: {
          type: 'list',
          choices: parseTokens(lando.cache.get(githubTokenCache)),
          message: 'Select a GitHub user',
          when: answers => showTokenList(answers.source, lando.cache.get(githubTokenCache)),
          weight: 110,
        },
      },
      'github-auth-token': {
        hidden: true,
        interactive: {
          name: 'github-auth',
          type: 'password',
          message: 'Enter a GitHub personal access token',
          when: answers => showTokenEntry(answers.source, answers['github-auth'], lando.cache.get(githubTokenCache)),
          weight: 120,
        },
      },
      'github-repo': {
        describe: 'GitHub git url',
        string: true,
        interactive: {
          type: 'autocomplete',
          message: 'Which repo?',
          source: (answers, input) => {
            return getAutoCompleteRepos(answers, lando.Promise, input);
          },
          when: answers => answers.source === 'github',
          weight: 130,
        },
      },
    }),
    build: (options, lando) => ([
      {name: 'generate-key', cmd: `/helpers/generate-key.sh ${gitHubLandoKey} ${gitHubLandoKeyComment}`},
      {name: 'post-key', func: (options, lando) => {
        return postKey(path.join(lando.config.userConfRoot, 'keys'), options['github-auth']);
      }},
      {name: 'reload-keys', cmd: '/helpers/load-keys.sh --silent', user: 'root'},
      {name: 'clone-repo', cmd: `/helpers/get-remote-url.sh ${options['github-repo']}`, remove: true},
      {name: 'set-caches', func: (options, lando) => setCaches(options, lando)},
    ]),
  }],
};
