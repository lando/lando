/**
 * Sharing plugin
 *
 * @name sharing
 */

'use strict';

module.exports = function(lando) {

  // Add sharing settings to the global config
  require('./lib/bootstrap')(lando);

  // The tooling service
  require('./lib/tooling')(lando);

};
