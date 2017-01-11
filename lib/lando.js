/**
 * Main library entrypoint to get all of lando
 *
 * @name lando
 */

'use strict';

// Modules
var _ = require('./node')._;

// Return lando
module.exports = _.once(function(config) {
  return {
    bootstrap: require('./bootstrap'),
    cache: require('./cache'),
    config: config,
    env: require('./env'),
    error: require('./error'),
    log: require('./logger'),
    node: require('./node'),
    plugins: require('./plugins'),
    Promise: require('./promise'),
    user: require('./user')
  };
});
