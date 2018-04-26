/**
 * Symfony 3.4 recipe builder
 *
 * @name symfony34
 */

'use strict';

module.exports = function(lando) {

    // Modules
    var _ = lando.node._;
    var path = require('path');
    var configDir = path.join(lando.config.servicesConfigDir, 'symfony34');

  /**
   * Build out Symony 3.4
   */
  var build = function(name, config) {
      // Start by cheating
      var build = lando.recipes.build(name, 'lamp', config);
      config.conf = config.cong || {};
      config.php = _.get(config, 'php', '7.0');
      config.conf.server = path.join(configDir, 'symfony34.conf');

      // Add Symfony Console to the tooling
      build.tooling.console = {
        service: 'appserver',
        cmd: ['php', '/app/bin/console'],
        description: 'Run Symfony console commands',
      };

    // Return the things
    return build;

  };

    // Return the things
    return {
        build: build,
        configDir: __dirname
    };

};
