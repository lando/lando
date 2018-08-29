'use strict';

// Modules
const _ = require('lodash');
const hasher = require('object-hash');
const Lando = require('./lando');

/**
 * Contains the main bootstrap function, which will:
 *
 *   1. Instantiate the lando object.
 *   2. Emit bootstrap events
 *   3. Initialize plugins
 *
 * You will want to use this to grab `lando` instead of using `new Lando(config)`.
 * The intiialization config in the example below is not required but recommended. You can
 * pass in any additional properties to override subsequently set/default values.
 *
 * Check out `./bin/lando.js` in this repository for an example of bootstraping
 * `lando` for usage in a CLI.
 *
 * @since 3.0.0
 * @alias lando
 * @fires pre_bootstrap
 * @fires post_bootstrap
 * @param {Object} [options] Options to initialize the bootstrap
 * @return {Object} An initialized Lando object
 * @example
 * // Get the bootstrap function
 * const bootstrap = require('./lib/bootstrap');
 * const options = {
 *   logLevelConsole: LOGLEVELCONSOLE,
 *   userConfRoot: USERCONFROOT,
 *   envPrefix: ENVPREFIX,
 *   configSources: configSources,
 *   pluginDirs: [USERCONFROOT],
 *   mode: 'cli'
 * };
 *
 * // Initialize Lando with some options
 * bootstrap(options).then(lando => cli.init(lando));
 */
module.exports = (options = {}) => {
  // @todo: we need to get this to not load any configSrcs by default
  // Get our config helpers
  const helpers = require('./config');
  // Start building the config
  let config = helpers.merge(helpers.defaults(), options);
  // If we have configSources let's merge those in as well
  if (!_.isEmpty(config.configSources)) config = helpers.merge(config, helpers.loadFiles(config.configSources));
  // If we have an envPrefix set then lets merge that in as well
  if (_.has(config, 'envPrefix')) config = helpers.merge(config, helpers.loadEnvs(config.envPrefix));

  // Add some final computed properties to the config
  config.instance = hasher(config.userConfRoot);

  // Summon lando
  const lando = new Lando(config);

  // Log that we've begun
  lando.log.info('Bootstraping...');
  lando.log.silly('It\'s not particularly silly, is it?');

  /**
   * Event that allows other things to augment the lando global config.
   *
   * This is useful so plugins can add additional config settings to the global
   * config.
   *
   * NOTE: This might only be available in core plugins
   *
   * @since 3.0.0
   * @event pre_bootstrap
   * @property {Object} config The global Lando config
   * @example
   * // Add engine settings to the config
   * lando.events.on('pre-bootstrap', config => {
   *   const engineConfig = daemon.getEngineConfig();
   *   config.engineHost = engineConfig.host;
   * });
   */
  return lando.events.emit('pre-bootstrap', lando.config)

  // We should have the fully constructed config at this point
  .then(() => lando.log.debug('Config set: %j', lando.config))

  // Return our plugins so we can init them
  .then(() => lando.config.plugins)

  // Init the plugins
  .map(plugin => lando.plugins.load(plugin, lando.config.pluginDirs, lando))

  /**
   * Event that allows other things to augment the lando object.
   *
   * This is useful so plugins can add additional modules to lando before
   * the bootstrap is completed.
   *
   * @since 3.0.0
   * @event post_bootstrap
   * @property {Object} lando The Lando object
   * @example
   * // Add the services module to lando
   * lando.events.on('post-bootstrap', lando => {
   *   lando.services = require('./services')(lando);
   * });
   */
  .then(() => lando.events.emit('post-bootstrap', lando))

  // Log the doneness
  .then(() => lando.log.info('Bootstrap completed.'))
  .then(() => lando);
};
