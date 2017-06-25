/**
 * This bootstraps the init framework
 *
 * @name bootstrap
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;

  // Add services modules to lando
  lando.events.on('post-bootstrap', 1, function(lando) {

    // Log
    lando.log.info('Initializing init framework');

    // Add init to lando
    lando.init = require('./init')(lando);

  });

  // Add init plugins
  lando.events.on('post-bootstrap', 2, function(lando) {

    // Add init methods
    lando = lando;
    //lando.init.add('core', require('./init/core')(lando));

  });

  // Go through our init methods and log them
  lando.events.on('post-bootstrap', 9, function(lando) {
    _.forEach(lando.init.get(), function(method) {
      lando.log.verbose('Init method %s loaded', method);
    });
  });

};
