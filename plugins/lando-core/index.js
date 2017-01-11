/**
 * Our core plugin
 *
 * @name index
 */

'use strict';

module.exports = function(lando) {

  // Load CLI tasks for this plugin.
  require('./lib/tasks.js')(lando);

};
