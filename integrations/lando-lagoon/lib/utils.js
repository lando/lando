'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const build = require('../../../plugins/lando-recipes/lib/build');

// TODO: Figure out how to run a command in the container before app is created.
exports.landoRun = (lando, cmd) => {
  const options = {name: 'landoinit', destination: '/tmp'};
  const config = build.runDefaults(lando, options);
  config.cmd = cmd;
  return build.run(lando, build.buildRun(config));
};

/*
 * Returns keys after adding any new, sorting, purging orphans, and updating cache.
 */
exports.getProcessedKeys = (lando, newKeys=[]) => {
  const allKeys = sortKeys(lando.cache.get('lagoon.keys'), newKeys);
  const keyPath = path.join(lando.config.home, '.lando', 'keys');
  // Remove cached keys that don't have ssh key files.
  const processedKeys = _(allKeys).filter(key => {
    return key !== undefined && fs.existsSync(path.join(keyPath, key.id));
  }).value();
  lando.cache.set('lagoon.keys', processedKeys, {persist: true});
  return processedKeys;
};

/*
 * Adds/updates key in cache array
 * Pass in the result of lando.cache.get(lagoonKeyCache) for the keyCache
 * You must still call lando.cache.set() on result
 */
exports.updateKey = (keyCache, key) => {
  const index = _.findIndex(keyCache, o => o.id === key.id);
  if (index !== -1) {
    keyCache.splice(index, 1, key);
  }
};

/*
 * Sort keys by most recent
 */
const sortKeys = (...sources) => _(_.flatten([...sources]))
  .filter(key => key !== null)
  .sortBy('date')
  .groupBy('id')
  .map(keys => _.last(keys))
  .value();

exports.sortKeys = sortKeys;
