'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const PlatformshApiClient = require('./client');
const path = require('path');

/*
 * Helper to build index service
 */
exports.getPlatformshInquirerEnvs = (token, site, nopes = [], log = console.log) => {
  const api = new PlatformshApiClient(token, log);
  return api.auth().then(() => api.getSiteEnvs(site)
  .map(env => ({name: env.id, value: env.id}))
  .filter(env => !_.includes(nopes, env.value))
  .then(envs => _.flatten([envs, [{name: 'none', value: 'none'}]])))
  .catch(err => {
    throw (_.has(err, 'response.data')) ? new Error(err.response.data) : err;
  });
};

/*
 * Helper to get terminus tokens
 */
exports.getPlatformshTokens = home => {
  if (fs.existsSync(path.join(home, '.platformsh', 'cache', 'tokens'))) {
    return _(fs.readdirSync(path.join(home, '.platformsh', 'cache', 'tokens')))
      .map(tokenFile => path.join(home, '.platformsh', 'cache', 'tokens', tokenFile))
      .map(file => JSON.parse(fs.readFileSync(file, 'utf8')))
      .value();
  } else {
    return [];
  }
};

/*
 * Helper to return most recent tokens
 */
exports.sortTokens = (...sources) => _(_.flatten([...sources]))
  .sortBy('date')
  .groupBy('email')
  .map(tokens => _.last(tokens))
  .value();
