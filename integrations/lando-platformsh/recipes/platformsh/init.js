'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const os = require('os');
const path = require('path');
const utils = require('./../../lib/utils');
const PlatformshApiClient = require('platformsh-client').default;

// Platformsh
const platformshTokenCache = 'platformsh.tokens';
const platformshLandoKey = 'platformsh.lando.id_rsa';
const platformshLandoKeyComment = 'lando@' + os.hostname();
let platformshSites = [];

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
  const api = new PlatformshApiClient({api_token: _.trim(answers['platformsh-auth'])});
  if (!_.isEmpty(platformshSites)) {
    return lando.Promise.resolve(platformshSites).filter(site => _.startsWith(site.name, input));
  } else {
    return api.getAccountInfo().then(me => {
      platformshSites = _.map(me.projects, project => ({name: project.title, value: project.name}));
      return platformshSites;
    })
    .catch(err => lando.Promise.reject(Error(err.error_description)));
  }
};

/*
 * Init platform.sh
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
    'platformsh-key-name': {
      describe: 'A hidden field mostly for easy testing and key removal',
      string: true,
      hidden: true,
      default: 'Landokey',
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
    build: (options, lando) => {
      // Get the api client with the passed in auth
      const api = new PlatformshApiClient({api_token: _.trim(options['platformsh-auth'])});
      return [
        {name: 'generate-key', cmd: `/helpers/generate-key.sh ${platformshLandoKey} ${platformshLandoKeyComment}`},
        {name: 'post-key', func: (options, lando) => {
          const pubKeyPath = path.join(lando.config.userConfRoot, 'keys', `${platformshLandoKey}.pub`);
          const pubKeyData = _.trim(fs.readFileSync(pubKeyPath, 'utf8'));
          const keyName = options['platformsh-key-name'];
          return api.addSshKey(pubKeyData, keyName).catch(err => {
            lando.log.verbose('Could not post key %s', keyName, err);
          });
        }},
        {name: 'get-git-url', func: (options, lando) => {
          // Get the account info
          return api.getAccountInfo()
          // Find and return the project id
          .then(me => {
            const project = _.find(me.projects, {name: options['platformsh-site']});
            return project.id;
          })
          // Get information about the project itself
          .then(id => api.getProject(id))
          // Set the git stuff
          .then(site => {
            options['platformsh-git-url'] = site.repository.url;
            options['platformsh-git-ssh'] = site.repository.url.split(':')[0];
          });
        }},
        {name: 'reload-keys', cmd: '/helpers/load-keys.sh --silent', user: 'root'},
        {
          name: 'clone-repo',
          cmd: options => `/helpers/psh-clone.sh ${options['platformsh-git-url']} ${options['platformsh-git-ssh']}`,
          remove: 'true',
        },
      ];
    },
  }],
  build: (options, lando) => {
    // API TIME
    const api = new PlatformshApiClient({api_token: _.trim(options['platformsh-auth'])});
    // Get our sites and user
    return api.getAccountInfo().then(me => {
      // Get the project
      const project = _.find(me.projects, {name: options['platformsh-site']});
      // Or error if there is no spoon
      if (_.isEmpty(project)) throw Error(`${options['platformsh-site']} does not appear to be a platform.sh site!`);

      // This is a good token, lets update our cache
      const cache = {token: options['platformsh-auth'], email: me.mail, date: _.toInteger(_.now() / 1000)};
      // Update lando's store of platformsh machine tokens
      const tokens = lando.cache.get(platformshTokenCache) || [];
      lando.cache.set(platformshTokenCache, utils.sortTokens(tokens, [cache]), {persist: true});
      // Update app metdata
      const metaData = lando.cache.get(`${options.name}.meta.cache`);
      lando.cache.set(`${options.name}.meta.cache`, _.merge({}, metaData, cache), {persist: true});

      return {config: {
        id: _.get(project, 'id', 'lando'),
      }};
    });
  },
};
