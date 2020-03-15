'use strict';

// Modules
const _ = require('lodash');
const os = require('os');
const path = require('path');
const PlatformshApiClient = require('./../../lib/client');
const utils = require('./../../lib/utils');
const url = require('url');

// Platformsh
const platformshTokenCache = 'platformsh.tokens';
const platformshLandoKey = 'platformsh.lando.id_rsa';
const platformshLandoKeyComment = 'lando@' + os.hostname();
let platformshSites = [];

// Helper to parse a platformsh site into a git url
const getGitUrl = site => url.format({
  auth: `codeserver.dev.${site.id}`,
  protocol: 'ssh:',
  slashes: true,
  hostname: `codeserver.dev.${site.id}.drush.in`,
  port: '2222',
  pathname: '/~/repository.git',
});

// Helper to get tokens
const getTokens = (home, tokens = []) => _(utils.sortTokens(utils.getPlatformshTokens(home), tokens))
  .map(token => ({name: token.email, value: token.token}))
  .thru(tokens => tokens.concat([{name: 'add or refresh a token', value: 'more'}]))
  .value();

// Helper to determine whether to show list of pre-used tokens or not
const showTokenList = (data, tokens = []) => data === 'platformsh' && !_.isEmpty(tokens);

// Helper to determine whether to show token password entry or not
const showTokenEntry = (data, answer, tokens = []) => data === 'platformsh' && (_.isEmpty(tokens) || answer === 'more');

// Helper to get sites for autocomplete
const getAutoCompleteSites = (answers, lando, input = null) => {
  if (!_.isEmpty(platformshSites)) {
    return lando.Promise.resolve(platformshSites).filter(site => _.startsWith(site.name, input));
  } else {
    const api = new PlatformshApiClient(answers['platformsh-auth'], lando.log);
    return api.auth()
      .then(() => api.getSites()
      .map(site => ({name: site.title, value: site.id})))
      .then(sites => {
        platformshSites = sites;
        return platformshSites;
    });
  }
};

// Helper to get sites for autocomplete
const getAutoCompleteEnvs = (answers, lando, input = null) => {
  const api = new PlatformshApiClient(answers['platformsh-auth'], lando.log);
  return api.auth()
    .then(() => api.getSiteEnvs(answers['platformsh-site'])
      .map(env => ({name: env.name, value: env.name})))
    .then(platformshEnvs => {
      return platformshEnvs;
    });
};

/*
 * Init Lamp
 */
module.exports = {
  name: 'platformsh',
  options: lando => ({
    'platformsh-auth': {
      describe: 'A Platform.sh access token',
      string: true,
      interactive: {
        type: 'list',
        choices: getTokens(lando.config.home, lando.cache.get(platformshTokenCache)),
        message: 'Select a Platform.sh account',
        when: answers => showTokenList(answers.recipe, lando.cache.get(platformshTokenCache)),
        weight: 510,
      },
    },
    'platformsh-auth-token': {
      hidden: true,
      interactive: {
        name: 'platformsh-auth',
        type: 'password',
        message: 'Enter a Platform.sh access token',
        when: answers => showTokenEntry(answers.recipe, answers['platformsh-auth'],
          lando.cache.get(platformshTokenCache)),
        weight: 520,
      },
    },
    'platformsh-site': {
      describe: 'A Platformsh project name',
      string: true,
      interactive: {
        type: 'autocomplete',
        message: 'Which project?',
        source: (answers, input) => {
          return getAutoCompleteSites(answers, lando, input);
        },
        when: answers => answers.recipe === 'platformsh',
        weight: 530,
      },
    },
    'platformsh-env': {
      describe: 'A Platform.sh environment',
      string: true,
      interactive: {
        type: 'autocomplete',
        message: 'Which environment?',
        source: (answers, input) => {
          return getAutoCompleteEnvs(answers, lando, input);
        },
        when: answers => answers.recipe === 'platformsh',
        weight: 530,
      },
    },
  }),
  overrides: {
    name: {
      when: answers => {
        answers.name = answers['platformsh-site'];
        return false;
      },
    },
    webroot: {
      when: () => false,
    },
  },
  sources: [{
    name: 'platformsh',
    label: 'platformsh',
    overrides: {
      recipe: {
        when: answers => {
          answers.recipe = 'platformsh';
          return false;
        },
      },
    },
    build: (options, lando) => ([
      {name: 'generate-key', cmd: `/helpers/generate-key.sh ${platformshLandoKey} ${platformshLandoKeyComment}`},
      {name: 'post-key', func: (options, lando) => {
        const api = new PlatformshApiClient(options['platformsh-auth'], lando.log);
        const pubKey = path.join(lando.config.userConfRoot, 'keys', `${platformshLandoKey}.pub`);
        return api.auth().then(() => api.postKey(pubKey));
      }},
      {name: 'get-git-url', func: (options, lando) => {
        const api = new PlatformshApiClient(options['platformsh-auth'], lando.log);
        return api.auth().then(() => api.getSites())
        .filter(site => site.name === options['platformsh-site'])
        .then(site => {
          options['platformsh-git-url'] = getGitUrl(site[0]);
        });
      }},
      {name: 'reload-keys', cmd: '/helpers/load-keys.sh', user: 'root'},
      {
        name: 'clone-repo',
        cmd: options => `/helpers/get-remote-url.sh ${options['platformsh-git-url']}`,
        remove: 'true',
      },
    ]),
  }],
  build: (options, lando) => {
    const api = new PlatformshApiClient(options['platformsh-auth'], lando.log);
    // Get our sites and user
    return api.auth().then(() => Promise.all([api.getSites(), api.getUser()]))
    // Parse the dataz and set the things
    .then(results => {
      // Get our site and email
      const site = _.head(_.filter(results[0], site => site.name === options['platformsh-site']));
      const user = results[1];

      // Error if site doesn't exist
      if (_.isEmpty(site)) throw Error(`${site} does not appear to be a Platformsh site!`);

      // This is a good token, lets update our cache
      const cache = {token: options['platformsh-auth'], email: user.email, date: _.toInteger(_.now() / 1000)};

      // Update lando's store of platformsh machine tokens
      const tokens = lando.cache.get(platformshTokenCache) || [];
      lando.cache.set(platformshTokenCache, utils.sortTokens(tokens, [cache]), {persist: true});
      // Update app metdata
      const metaData = lando.cache.get(`${options.name}.meta.cache`);
      lando.cache.set(`${options.name}.meta.cache`, _.merge({}, metaData, cache), {persist: true});

      // Add some stuff to our landofile
      return {config: {
        framework: _.get(site, 'framework', 'drupal'),
        site: _.get(site, 'name', options.name),
        id: _.get(site, 'id', 'lando'),
      }};
    });
  },
};
