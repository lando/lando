/**
 * This does the service config parsin
 *
 * @name config
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;

  // Do all the recipes magix
  lando.events.on('post-instantiate-app', 2, function(app) {

    // Check to see if we have a recipe
    if (!_.isEmpty(app.config.recipe)) {

      // Get some things
      var name = app.config.name;
      var recipe = app.config.recipe;
      var config = app.config.config || {};

      // Add some things to our config
      config.app = name;
      config.mount = app.mount;

      // Get our new config
      var newConfig = lando.recipes.build(name, recipe, config);

      // Merge it in
      app.config = _.merge(app.config, newConfig);

    }

  });

};
