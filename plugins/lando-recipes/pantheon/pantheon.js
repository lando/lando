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

    // If the framework is drupal, then use drupal7
    if (framework === 'drupal') {
      framework = 'drupal7';
    }

    // Load up the stack
    var stack = require('./../' + [framework, framework].join('/'))(lando);

    // Update with new config defaults if needed
    config = stack.resetConfig(framework, config);

    // Pantheon uses the following:
    config.via = 'nginx:1.8';
    config.database = 'mariadb:10.0';

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
