const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const utils = require('./utils');

// Lando cache ID for Lagoon keys.
const keyCacheId = 'lagoon.keys';

// Globals defined to get around limitations
// in state between various sections of an inquirer object.
exports.lastKeyGeneratedOutput = null;
exports.currentKey = null;

/*
 * Default key object settings for lando.keys cache
 */
const keyDefaults = {
  // Key id is used for the /lando/keys SSH filename
  id: null,
  name: null,
  email: null,
  host: 'ssh.lagoon.amazeeio.cloud',
  port: '32222',
  user: 'lagoon',
  url: 'https://api.lagoon.amazeeio.cloud',
  date: _.toInteger(_.now() / 1000),
};

/*
 * i.e. me@example.com -> lagoon_me-at-example.com_ssh.lagoon.amazeeio.cloud
 */
const getKeyId = (host, email = '') => `lagoon_${email.replace('@', '-at-')}_${host}`;

/*
 * Renames lagoon-pending keys to the ID specified.
 * Should only be promoted after validating.
 * lando.config.userConfRoot
 */
const promotePendingKeyFile = (id, userConfRoot) => {
  const keyDir = path.join(userConfRoot, 'keys');
  const oldPath = path.join(keyDir, 'lagoon-pending');
  const newPath = path.join(userConfRoot, 'keys', id);
  fs.renameSync(oldPath, newPath);
  fs.renameSync(`${oldPath}.pub`, `${newPath}.pub`);
  if (fs.existsSync(`${oldPath}.token`)) {
    fs.renameSync(`${oldPath}.token`, `${newPath}.token`);
  }
};

/*
 * Returns keys after adding any new, sorting, purging orphans, and updating cache.
 */
const getProcessedKeys = (lando, newKeys=[]) => {
  const allKeys = sortKeys(lando.cache.get(keyCacheId), newKeys);
  const keyPath = path.join(lando.config.home, '.lando', 'keys');
  // Remove cached keys that don't have ssh key files.
  const processedKeys = _(allKeys)
    .filter(key => {
      return key !== undefined && fs.existsSync(path.join(keyPath, key.id));
    })
    .filter(key => key.id !== 'lagoon-pending')
    .value();
  lando.cache.set(keyCacheId, processedKeys, {persist: true});
  return processedKeys;
};

/*
 * Efficiently adds/updates key in cache array.
 */
const setKeyInCache = (lando, key) => {
  const keyCache = lando.cache.get(keyCacheId);
  const index = _.findIndex(keyCache, o => o.id === key.id);
  if (index !== -1) {
    keyCache.splice(index, 1, key);
  } else {
    keyCache.push(key);
  }
  lando.cache.set(keyCacheId, keyCache, {persist: true});
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

/*
 * Generates a new key object by merging in
 * opts arg into the key Defaults.
 */
const getNewKey = opts => {
  const defaults = keyDefaults;
  if (!opts.email) {
    throw new Error('getNewKey options must contain an email property');
  }

  const newKey = _.merge(defaults, opts);
  newKey.id = getKeyId(newKey.host, newKey.email);
  newKey.name = `${newKey.email} [${newKey.host}]`;

  return newKey;
};

/*
 * Simply returns the raw key cache.
 */
exports.getCachedKeys = lando => {
  return lando.cache.get(keyCacheId);
};

/*
 * Creates a 'lagoon-pending' key structure and assures
 * it exists in the Lando cache for the api lib to work with.
 */
exports.setPendingKey = (lando, opts = {}) => {
  const key = getNewKey(_.merge(opts, {email: 'lagoon@example.com'}));
  key.id = 'lagoon-pending';
  setKeyInCache(lando, key);
};

/*
 * Promotes `lando-pending` to a properly named key.
 * This should be run after the pending key has been validated.
 */
exports.promotePendingKey = (lando, opts) => {
  const key = getNewKey(opts);
  promotePendingKeyFile(key.id, lando.config.userConfRoot);
  setKeyInCache(lando, key);
  exports.currentKey = key;
  return key;
};

/*
 * Key choices for inquirer; Orphaned and pending keys are omitted.
 */
exports.getKeyChoices = (lando = []) => _(getProcessedKeys(lando))
  .map(key => ({name: key.email, value: key.id}))
  .thru(tokens => tokens.concat([{name: 'add a key', value: 'new'}]))
  .value();

/*
 * Generates a new lagoon-pending key.
 */
exports.generateKeyAndWait = lando => {
  const cmd = '/helpers/lagoon-generate-key.sh lagoon-pending lando';
  return utils.run(lando, cmd).then(stdout => {
    // Set in exports for easier management for consumers.
    exports.lastKeyGeneratedOutput = stdout;
    return stdout;
  });
};
