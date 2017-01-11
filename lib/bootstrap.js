/**
 * Lando initialization system.
 *
 * @name bootstrap
 */

'use strict';

// Modules
var _ = require('./node')._;
var config = require('./config');

module.exports = _.once(function(opts, done) {

  // Merge in our opts to the config
  config = _.merge(config, opts);

  // Summon lando
  var lando = require('./lando')(config);

  // Start promise chain.
  return lando.Promise.resolve()

  // Get the global configuration
  .then(function() {
    return lando.config.plugins;
  })

  // Init plugins.
  .map(function(plugin) {
    return lando.plugins.load(plugin);
  })

  // Return lando
  .then(function() {
    return lando;
  })

  // Allow callback or returning of a promise.
  .nodeify(done);

});
