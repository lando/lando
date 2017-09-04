/**
 * This adds recipe settings to our config
 *
 * @name bootstrap
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;

  // Add recipe modules to lando
  lando.events.on('post-bootstrap', 1, function(lando) {

    // Log
    lando.log.info('Initializing recipes');

    // Add recipes to lando
    lando.recipes = require('./recipes')(lando);

  });

  // Add particular recipes to lando
  lando.events.on('post-bootstrap', function(lando) {

    // Recipes
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

    // Load the recipes
    _.forEach(recipes, function(recipe) {
      var recipeModule = './../' + [recipe, recipe].join('/');
      lando.recipes.add(recipe, require(recipeModule)(lando));
    });

  });

  // Go through our recipes and log them
  lando.events.on('post-bootstrap', 8, function(lando) {
    _.forEach(lando.recipes.get(), function(recipe) {
      lando.log.verbose('Recipe %s loaded', recipe);
    });
  });

};
