/**
 * Our core plugin
 *
 * @name index
 */

'use strict';

module.exports = function(lando) {

  // Load tasks for this plugin.
  require('./lib/tasks')(lando);

  // Basic app services handling
  require('./lib/services')(lando);

  // Basic environment handling
  require('./lib/env')(lando);

};
