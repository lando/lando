/**
 * Sharing plugin
 *
 * @name sharing
 */

'use strict';

module.exports = function(lando) {

  // Add sharing settings to the global config
  require('./lib/bootstrap')(lando);

  // The sharing service
  require('./lib/sharing')(lando);

};
