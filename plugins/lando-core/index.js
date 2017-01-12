/**
 * Our core plugin
 *
 * @name index
 */

'use strict';

module.exports = function(lando) {

  // Load CLI tasks for this plugin.
  require('./lib/tasks.js')(lando);

  // Load in all our commands
  lando.events.on('post-engine-up', function() {
    console.log('ahhh yes');
  });

};
