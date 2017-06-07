/**
 * Tooling plugin
 *
 * @name tooling
 */

'use strict';

module.exports = function(lando) {

  // Add tooling settings to the global config
  require('./lib/bootstrap')(lando);

  // The tooling service
  require('./lib/tooling')(lando);

};
