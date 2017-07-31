/**
 * This adds events settings to our config
 *
 * @name bootstrap
 */

'use strict';

module.exports = function(lando) {

  // Add tooling module to lando
  lando.events.on('post-bootstrap', 1, function(lando) {
    lando.log.info('Initializing events');
  });

};
