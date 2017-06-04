/**
 * Contains the main bootstrap function.
 *
 * @since 3.0.0
 * @module bootstrap
 * @example
 *
 * // Get the bootstrap function
 * var bootstrap = require('./../lib/bootstrap.js');
 *
 * // Initialize Lando in CLI mode
 * bootstrap({mode: 'cli'})
 *
 * // Initialize CLI
 * .tap(function(lando) {
 *   return lando.cli.init(lando);
 * })
 */
'use strict';

// Modules
var _ = require('./node')._;
var config = require('./config');

/**
 * The main bootstrap function.
 *
 * This will:
 *
 *   1. Instantiate the lando object.
 *   2. Emit bootstrap events
 *   3. Initialize plugins
 *
 * @since 3.0.0
 * @name bootstrap
 * @static
 * @fires pre-bootstrap
 * @fires post-bootstrap
 * @param {Object} opts - Options to tweak the bootstrap
 * @param {String} opts.mode - The mode to run the bootstrap with
 * @returns {Object} An initialized Lando object
 * @example
 *
 * // Get the bootstrap function
 * var bootstrap = require('./../lib/bootstrap.js');
 *
 * // Initialize Lando in CLI mode
 * bootstrap({mode: 'cli'})
 *
 * // Initialize CLI
 * .tap(function(lando) {
 *   return lando.cli.init(lando);
 * })
 */
module.exports = _.once(function(opts) {

  // Merge in our opts to the configs
  config = _.merge(config, opts);

  // Summon lando
  var lando = require('./lando')(config);

  // Log that we've begun
  lando.log.info('Bootstrap starting...');
  lando.log.debug('Boostrapping with', lando.config);

  /**
   * Event that allows other things to augment the lando global config.
   *
   * This is useful so plugins can add additional config settings to the global
   * config.
   *
   * @since 3.0.0
   * @event module:bootstrap.event:pre-bootstrap
   * @property {Object} config The global Lando config
   * @example
   *
   * // Add engine settings to the config
   * lando.events.on('pre-bootstrap', function(config) {
   *
   *   // Get the docker config
   *   var engineConfig = daemon.getEngineConfig();
   *
   *   // Add engine host to the config
   *   config.engineHost = engineConfig.host;
   *
   * });
   */
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

  /**
   * Event that allows other things to augment the lando object.
   *
   * This is useful so plugins can add additional modules to lando before
   * the bootstrap is completed.
   *
   * @since 3.0.0
   * @event module:bootstrap.event:post-bootstrap
   * @property {Object} lando The Lando object
   * @example
   *
   * // Add the services module to lando
   * lando.events.on('post-bootstrap', function(lando) {
   *   lando.services = require('./services')(lando);
   * });
   */
  .then(function() {
    lando.log.info('Core plugins loaded');
    return lando.events.emit('post-bootstrap', lando);
  })

  // Return a fully initialized lando
  .then(function() {
    lando.log.info('Bootstrap completed.');
    return lando;
  });

});
