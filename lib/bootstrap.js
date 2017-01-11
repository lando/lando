/**
 * Lando initialization system.
 *
 * @name bootstrap
 */

'use strict';

// Modules
var _ = require('./node')._;
var config = require('./config');

module.exports = _.once(function(opts) {

  // Merge in our opts to the configs
  config = _.merge(config, opts);

  // Summon lando
  var lando = require('./lando')(config);

  // Log that we've begun
  lando.log.info('Bootstrap starting...');
  lando.log.debug('Boostrapping with', lando.config);

  // Emit Pre bootstrap event
  // This is only meant to be used from elsewhere in core
  return lando.events.emit('pre-bootstrap', lando.config)

  // Return our plugins so we can init them
  .then(function() {
    lando.log.verbose('Trying to load plugins', lando.config.plugins);
    return lando.config.plugins;
  })

  // Init the plugins
  .map(function(plugin) {
    return lando.plugins.load(plugin);
  })

  // Emit the post bootstrap event
  .then(function() {
    return lando.events.emit('post-bootstrap', lando);
  })

  // Return a fully initialized lando
  .then(function() {
    lando.log.info('Bootstrap completed.');
    return lando;
  });

});
