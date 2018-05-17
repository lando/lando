'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var merger = lando.utils.config.merge;

  // Meta
  var recipes = [
    'backdrop',
    'drupal6',
    'drupal7',
    'drupal8',
    'joomla',
    'laravel',
    'lamp',
    'lemp',
    'mean',
    'pantheon',
    'wordpress'
  ];

  // Add recipe modules to lando
  lando.events.on('post-bootstrap', 2, function(lando) {

    // Log
    lando.log.info('Initializing recipes plugin');

    // Add recipes to lando
    lando.recipes = require('./recipes')(lando);

  });

  // Add particular recipes to lando
  lando.events.on('post-bootstrap', function(lando) {
    _.forEach(recipes, function(recipe) {
      var recipeModule = './recipes/' + [recipe, recipe].join('/');
      lando.recipes.add(recipe, require(recipeModule)(lando));
    });

  });

  // Go through our recipes and log them
  lando.events.on('post-bootstrap', 8, function(lando) {
    _.forEach(lando.recipes.get(), function(recipe) {
      lando.log.verbose('Recipe %s loaded', recipe);
    });
  });

  // Do all the recipes magix
  lando.events.on('post-instantiate-app', 2, function(app) {

    // Check to see if we have a recipe
    if (!_.isEmpty(app.config.recipe)) {

      // Get some things
      var name = app.name;
      var recipe = app.config.recipe;
      var config = app.config.config || {};
      var services = app.config.services || {};

      // Add some internal properties to our config
      config._app = name;
      config._root = app.root;
      config._mount = app.mount;
      config._recipe = recipe;
      config._services = services;

      // Get our new config
      var newConfig = lando.recipes.build(name, recipe, config);

      // Proxy settings should be handled a bit differently
      if (_.has(app.config, 'proxy') && _.has(newConfig, 'proxy')) {
        app.config.proxy = _.merge(newConfig.proxy, app.config.proxy);
        delete newConfig.proxy;
      }

      // Our yml config on top of the new one, this allows for overrides to work
      app.config = merger(newConfig, app.config);

    }

  });

};
