/**
 * Services plugin
 *
 * @name services
 */

'use strict';

module.exports = function(lando) {

  // Add services config to the global config
  require('./lib/bootstrap')(lando);


};
