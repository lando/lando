/**
 * This adds sharing settings to our config
 *
 * @name bootstrap
 */

'use strict';

module.exports = function(lando) {

  // Add in some high level config for our proxy
  lando.events.on('post-bootstrap', function(lando) {

    // Log
    lando.log.info('Initializing services');

    // Add services to lando
    lando.services = require('./services');

    // Log it
    lando.log.verbose('Services initialized with config');

  });

};
