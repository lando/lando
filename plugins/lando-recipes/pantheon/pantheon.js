/**
 * Pantheon recipe builder
 *
 * @name pantheon
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;

  /**
   * Build out Pantheon
   */
  var build = function(name, config) {

    // Get the framework
    var framework = _.get(config, 'framework', 'drupal7');

    // Load up the stack
    var stack = require('./../' + [framework, framework].join('/'))(lando);

    // Update with new config defaults if needed
    config = stack.resetConfig(framework, config);

    // Pantheon uses nginx
    config.via = 'nginx';

    // Start by cheating
    var build = stack.build(name, config);

    // Return the things
    return build;

  };

  // Return the things
  return {
    build: build,
    configDir: __dirname
  };

};
