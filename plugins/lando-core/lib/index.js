/**
 * Our core plugin
 *
 * @name index
 */

'use strict';

module.exports = function(lando) {

  // Bootstrap init framework
  require('./lib/bootstrap')(lando);

  // Basic environment handling
  require('./lib/env')(lando);

  // Add a function to the app object so it can scan its URLs
  require('./lib/scan')(lando);

  // Basic app services handling
  require('./lib/services')(lando);

  // App url handling and discovery
  require('./lib/urls')(lando);

};
