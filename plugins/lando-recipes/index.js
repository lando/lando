/**
 * Recipes plugin
 *
 * @name recipes
 */

'use strict';

module.exports = function(lando) {

  // Add recipe config to the global config
  require('./lib/bootstrap')(lando);

  // Handle and parse our recipe config
  require('./lib/config')(lando);

};
