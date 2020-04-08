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
  if (!_.isEmpty(platformshSites)) {
    return lando.Promise.resolve(platformshSites).filter(site => _.startsWith(site.name, input));
  } else {
    const api = new PlatformshApiClient({api_token: _.trim(answers['platformsh-auth'])});
    return api.getAccountInfo().then(me => {
      platformshSites = _.map(me.projects, project => ({name: project.title, value: project.name}));
      return platformshSites;
    });
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
      const api = new PlatformshApiClient({api_token: _.trim(options.platformshAuth)});
      return [
        {name: 'generate-key', cmd: `/helpers/generate-key.sh ${platformshLandoKey} ${platformshLandoKeyComment}`},
        {name: 'post-key', func: (options, lando) => {
          const pubKeyPath = path.join(lando.config.userConfRoot, 'keys', `${platformshLandoKey}.pub`);
          const keyData = _.trim(fs.readFileSync(pubKeyPath, 'utf8'));
          return api.getAccountInfo().then(me => {
            const hasKey = !_.isEmpty(_(_.get(me, 'ssh_keys'))
              .filter(key => key.value === keyData)
              .value());
            if (!hasKey) return api.addSshKey(keyData, 'Landokey');
          });
        }},
        {name: 'get-git-url', func: (options, lando) => {
          return api.getAccountInfo()
          .then(me => {
            const project = _.find(me.projects, {name: options.platformshSite});
            return project.id;
          })
          .then(id => api.getProject(id))
          .then(site => {
            options['platformsh-git-url'] = site.repository.url;
          });
        }},
        {name: 'reload-keys', cmd: '/helpers/load-keys.sh', user: 'root'},
        {
          name: 'clone-repo',
          cmd: options => `/helpers/get-remote-url.sh ${options['platformsh-git-url']}`,
          remove: 'true',
        },
      ];
    },
  }],
  build: (options, lando) => {
    console.log(process.exit(1));
    const api = new PlatformshApiClient(options['platformsh-auth'], lando.log);
    // Get our sites and user
    // return api.auth().then(() => Promise.all([api.getSites()]))
    return api.auth().then(() => api.getSites())
    // Parse the data and set the things
      .then(sites => {
        return _.find(sites, site => site.id === options['platformsh-site']);
      })
      .then(site => {
        // Parse the subscription ID from the project so we can get the framework from the sub
        const pos = site.subscription.license_uri.lastIndexOf('/');
        const subId = site.subscription.license_uri.substring(pos + 1);
        return api.getSubscription(subId).then(sub => {
          site.subscription = sub;
          site.framework = sub.project_options.initialize.profile;
          return site;
        });
      })
      .then(site => {
        if (_.isEmpty(site)) throw Error(`${site} does not appear to be a Platformsh site!`);

        // This is a good token, lets update our cache
        const cache = {token: options['platformsh-auth'], date: _.toInteger(_.now() / 1000)};

        // Update lando's store of platformsh machine tokens
        const tokens = lando.cache.get(platformshTokenCache) || [];
        lando.cache.set(platformshTokenCache, utils.sortTokens(tokens, [cache]), {persist: true});
        // Update app metdata
        const metaData = lando.cache.get(`${options.name}.meta.cache`);
        lando.cache.set(`${options.name}.meta.cache`, _.merge({}, metaData, cache), {persist: true});

        return {config: {
          framework: _.get(site, 'framework', 'Drupal 8'),
          site: _.get(site, 'name', options.name),
          id: _.get(site, 'id', 'lando'),
        }};
      });
  },
};
