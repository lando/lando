'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

exports.getAcliUuid = () => {
  const file = '.acquia-cli.yml';
  if (fs.existsSync(file)) {
    const data = yaml.load(fs.readFileSync(file, 'utf8'));
    return data.cloud_app_uuid;
  }
  return null;
};

exports.writeAcliUuid = uuid => {
  const file = '.acquia-cli.yml';
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, `cloud_app_uuid: ${uuid}\n`);
    return true;
  }
  return false;
};

exports.writeEnvUuids = data => {
  const file = './acquia-envs.json';
  fs.writeFileSync(file, JSON.stringify(data));
  return false;
};

exports.getEnvUuids = () => {
  const file = './acquia-envs.json';
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  return null;
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
 * Returns keys fetched from cache & ~/.acquia/cloud_api.conf after caching the merged set.
 */
exports.getAcquiaKeys = lando => {
  const file = path.join(lando.config.home, '.acquia', 'cloud_api.conf');
  const systemKeys = {};
  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));

    if (data && data.keys) {
      // Return an object of keys, keyed by key uuid
      _.forEach(data.keys, key => {
        systemKeys[key.uuid] = key;
      });
      return _(systemKeys).sortBy('label').value();
    }
  }
  const cachedKeys = lando.cache.get('acquia.keys');
  const mergedKeys = _.merge(systemKeys, cachedKeys).sort('label').value();
  lando.cache.set('acquia.keys', mergedKeys, {persist: true});
  return mergedKeys;
};

/*
 * Returns the active key set in ~/.acquia/cloud_api.conf
 */
exports.getAcquiaKey = () => {
  const file = path.join('var', 'www', '.acquia', 'cloud_api.conf');
  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const activeKey = data.acli_key;
    return _.find(data.keys, key => key.uuid === activeKey);
  }
  return {};
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

