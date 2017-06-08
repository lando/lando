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

    // Add the recipes
    lando.recipes.add('drupal6', require('./../drupal6/drupal6')(lando));
    lando.recipes.add('drupal7', require('./../drupal7/drupal7')(lando));
    lando.recipes.add('lamp', require('./../lamp/lamp')(lando));
    lando.recipes.add('lemp', require('./../lemp/lemp')(lando));

  });

  // Go through our recipes and log them
  lando.events.on('post-bootstrap', 9, function(lando) {
    _.forEach(lando.recipes.get(), function(recipe) {
      lando.log.verbose('Recipe %s loaded', recipe);
    });
  });

};
