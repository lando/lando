'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;

  /*
   * Build out Drupal 6
   */
  var build = function(name, config) {

    // Set the default php version for D6
    config.php = _.get(config, 'php', '5.6');

    // Start by cheating
    var build = lando.recipes.build(name, 'drupal7', config);

    // Return the things
    return build;

  };

  // Return the things
  return {
    build: build,
    configDir: __dirname
  };

};
