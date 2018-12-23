'use strict';

module.exports = lando => {
  // Modules
  const _ = lando.node._;

  /*
   * Build D6
   */
  const build = (name, config) => {
    // Set the default php version for D6
    config.php = _.get(config, 'php', '5.6');
    // Start by cheating
    const build = lando.recipes.build(name, 'drupal7', config);
    // Return the things
    return build;
  };

  // Return the things
  return {
    build: build,
    configDir: __dirname,
  };
};
