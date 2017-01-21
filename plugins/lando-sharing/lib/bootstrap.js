/**
 * This adds sharing settings to our config
 *
 * @name bootstrap
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;

  // Add in some high level config for our proxy
  lando.events.on('post-bootstrap', function(lando) {

    // Log
    lando.log.info('Initializing sharing');

    // Proxy defaults
    var defaults = {
      sharing: 'ON'
    };

    // Merge config over defaults
    lando.config = _.merge(defaults, lando.config);

    // Grab the merged config
    var sharingConf = {
      sharing: lando.config.sharing
    };

    // Log it
    lando.log.verbose('Sharing initialized with config', sharingConf);

  });

};
