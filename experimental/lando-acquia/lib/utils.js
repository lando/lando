'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

exports.getAcliUuid = (file = '.acquia-cli.yml') => {
  if (fs.existsSync(file)) {
    const data = yaml.load(fs.readFileSync(file, 'utf8'));
    return data.cloud_app_uuid;
  }
  return null;
};

exports.writeAcliUuid = (uuid, file = '.acquia-cli.yml') => {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, `cloud_app_uuid: ${uuid}\n`);
    return true;
  }
  return false;
};

/*
 * Returns keys formatted for inquirer choices.
 */
exports.getAcquiaKeyChoices = lando => {
  const keys = exports.getAcquiaKeys(lando);
  return _(keys)
    .map(key => ({name: key.label, value: key.uuid, secret: key.secret}))
    .thru(keys => keys.concat([{name: 'add a key', value: 'more'}]))
    .value();
};

/*
 * Returns the active key set in appserver at /var/www/.acquia/cloud_api.conf
 */
exports.getAcquiaKeyFromApp = (lando, appConfig) => {
  const file = path.join(lando.config.home, '.lando', 'config', appConfig.name, '.acquia', 'cloud_api.conf');
  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const activeKey = data.acli_key;
    return _.find(data.keys, key => key.uuid === activeKey);
  }
  return null;
};


// Get best env
exports.getBestEnv = (envs = []) => {
  // Try to get the dev environment
  const dev = _.find(envs, env => env.name === 'dev');
  // Return dev environment if we have it otherwise just use the first one
  return (dev) ? dev : _.first(envs);
};

/*
 * Get acli token from host
 */
exports.getComposerConfig = () => {
  const file = path.join('composer.json');
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  return null;
};

/*
 * Returns keys fetched from cache & ~/.acquia/cloud_api.conf after caching the merged set.
 */
exports.getHostKeys = home => {
  // Path to acli conf
  const file = path.join(home, '.acquia', 'cloud_api.conf');
  // If no keyfile return empty
  if (!fs.existsSync(file)) return [];
  // Otherwise lets try to get some data
  const keys = _.get(JSON.parse(fs.readFileSync(file, 'utf8')), 'keys', []);
  // Loop through keys to merge in the key of the keys
  _.forEach(keys, (value, key) => value.key = key);
  // Return an array of keys
  return _.map(keys);
};

// Helper to get keys for inquirer
exports.getKeys = (keys = []) => _(keys)
  .map(key => ({name: key.label, value: `${key.key}:${key.secret}`}))
  .thru(keys => keys.concat([{name: 'add or refresh a key', value: 'more'}]))
  .value();

/*
 * Sort, reconcile and format keys
 */
exports.sortKeys = (...sources) => _(_.flattenDeep(sources))
  .uniqBy('uuid')
  .orderBy('label')
  .value();
