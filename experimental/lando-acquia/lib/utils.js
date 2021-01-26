'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

/*
 * Helper to get terminus tokens
 */
exports.getAcquiaTokens = home => {
  if (fs.existsSync(path.join(home, '.acquia', 'cache', 'tokens'))) {
    return _(fs.readdirSync(path.join(home, '.acquia', 'cache', 'tokens')))
      .map(tokenFile => path.join(home, '.acquia', 'cache', 'tokens', tokenFile))
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
