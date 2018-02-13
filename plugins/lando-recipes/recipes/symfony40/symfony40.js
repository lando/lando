/**
 * Symfony 4.0 recipe builder
 *
 * @name symfony40
 */

'use strict';

module.exports = function(lando) {

    // Modules
    var _ = lando.node._;
    var path = require('path');

    var configDir = path.join(lando.config.servicesConfigDir, 'symfony40');

  /**
   * Build out Symony 4.0
   */
  var build = function(name, config) {
      // Start by cheating
      var build = lando.recipes.build(name, 'lamp', config);
      config.conf = config.cong || {};
      config.php = _.get(config, 'php', '7.1');
      config.conf.server = path.join(configDir, 'symfony40.conf');

      // Set tooling
      // Add Symfony Console to the tooling
      build.tooling.console = {
        service: 'appserver',
        cmd: ['php', '/app/bin/console'],
        description: 'Run Symfony console commands',
      };
      // Add Symfony's PHPUnit.
      build.tooling.phpunit = {
          service: 'appserver',
          cmd: ['php', '/app/bin/phpunit'],
          description: 'Run PHPUnit',
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
