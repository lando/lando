/**
 * Proxy plugin
 *
 * @name proxy
 */

'use strict';

module.exports = function(lando) {

  // Add proxy settings to the global config
  require('./lib/bootstrap')(lando);

  // The proxy service
  require('./lib/proxy')(lando);

};
