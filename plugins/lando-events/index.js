/**
 * Events plugin
 *
 * @name events
 */

'use strict';

module.exports = function(lando) {

  // Add events settings to the global config
  require('./lib/bootstrap')(lando);

  // The event service
  require('./lib/events')(lando);

};
