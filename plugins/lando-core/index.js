/**
 * Our core plugin
 *
 * @name index
 */

'use strict';

module.exports = function(lando) {

  // Basic environment handling
  require('./lib/env')(lando);

  // App info handling and discovery
  require('./lib/info')(lando);

  // Add a function to the app object so it can scan its URLs
  require('./lib/scan')(lando);

  // Basic app services handling
  require('./lib/services')(lando);

  // Load tasks for this plugin.
  require('./lib/tasks')(lando);

};
