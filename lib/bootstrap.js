/**
 * Lando initialization system.
 *
 * @name bootstrap
 */

'use strict';

// Modules
var _ = require('./node')._;
var config = require('./config')();
var plugins = require('./plugins');
var Promise = require('./promise');

module.exports = _.once(function(opts, done) {

  // Merge in our opts to the config
  config = _.merge(config, opts);

  // Start promise chain.
  return Promise.resolve()

  // Get the global configuration
  .then(function() {
    return config.plugins;
  })

  // Init plugins.
  .map(function(plugin) {
    return plugins.load(plugin);
  })

  // Allow callback or returning of a promise.
  .nodeify(done);

});
