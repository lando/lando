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

  // Merge in our opts to the configs
  config = _.merge(config, opts);

  // Summon lando
  var lando = require('./lando')(config);

  // Start a promise chain
  return lando.Promise.resolve()

  // Return our plugins so we can init them
  .then(function() {
    return lando.config.plugins;
  })

  // Init plugins
  .map(function(plugin) {
    return lando.plugins.load(plugin);
  })

  // Return a fully initialized lando
  .then(function() {
    return lando;
  })

  // Allow callback or returning of a promise
  .nodeify(done);

});
