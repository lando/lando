const _ = require('lodash');
const utils = require('./utils');

/*
 * Default key object settings for lando.keys cache
 */
const keyDefaults = {
  host: 'lagoon.amazeeio.cloud',
  port: '32222',
  user: 'lagoon-pending',
  date: _.toInteger(_.now() / 1000),
};

/*
 * Generates a new lagoon-pending key.
 */
exports.generateKey = (lando, method = 'new') => {
  const cmd = '/helpers/lagoon-generate-key.sh lagoon-pending lando';
  return utils.run(lando, cmd, null, false);
};

/*
 * Put keys into inquierer format
 */
exports.getKeys = (keys = []) => _(keys)
  .map(key => ({name: key.email, value: key.key}))
  .thru(keys => keys.concat([{name: 'add a new key', value: 'more'}]))
  .compact()
  .value();

// Helper to get preferred key
exports.getPreferredKey = answers => {
  return answers['lagoon-auth-generate'] || answers['auth-generate'] || answers['lagoon-auth'] || answers['auth'];
};

/*
 * Parses a key over defaults to extact key/host/port info
 */
exports.parseKey = (key = {}) => {
  // Split the "key" and get it
  const splitter = key.split('@');
  const keyPath = _.first(splitter);

  // Now handle the host part
  const lagoon = keyDefaults;
  // If host part of splitter exists lets update things
  if (splitter[1]) {
    const parts = splitter[1].split(':');
    if (parts[0]) lagoon.host = parts[0];
    if (parts[1]) lagoon.port = parts[1];
  }
  return {keyPath, host: lagoon.host, port: lagoon.port};
};

/*
 * Sort keys by most recent
 */
exports.sortKeys = (...sources) => _(_.flatten([...sources]))
  .filter(key => key !== null)
  .sortBy('date')
  .groupBy('key')
  .map(keys => _.last(keys))
  .value();
