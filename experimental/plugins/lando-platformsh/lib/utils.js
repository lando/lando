'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

/*
 * Helper to return the php appserver recipe config
 */
const getPhpAppserver = (config = {}) => ({
  // CAN WE MAKE THE BELOW QUIET?
  // @TODO: this needs to be on all services right?
  build_as_root_internal: [
    '/helpers/boot-psh.sh',
    '/etc/platform/boot',
  ],
});

/*
 * Helper to get terminus tokens
 */
exports.getAppserver = (type, config = {}) => {
  switch (type) {
    case 'php': return getPhpAppserver(config);
  };
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
