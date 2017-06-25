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

      // Add some internal properties to our config
      config._app = name;
      config._root = app.root;
      config._mount = app.mount;
      config._recipe = recipe;

      // Get our new config
      var newConfig = lando.recipes.build(name, recipe, config);

      // Our yml config on top of the new one, this allows for overrides to work
      app.config = _.merge(newConfig, app.config);

    }

  });

};
