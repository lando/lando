/**
 * Lando initialization system.
 *
 * @name bootstrap
 */

'use strict';

// Grab required modules
var _ = require('./node')._;
var config = require('./config');
var Promise = require('./promise');

/**
 * Document
 */
module.exports = _.once(function(opts, done) {

  // Start promise chain.
  return Promise.resolve()

  // Return the config
  .then(function() {
    return config.getConfig();
  })

  // Load, register the global config and then set it into the env
  .then(function(config) {
    console.log(config);
  })

  // Allow callback or returning of a promise.
  .nodeify(done);

});
