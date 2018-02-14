'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;

  // Add init modules to lando
  lando.events.on('post-bootstrap', 2, function(lando) {

    // Log
    lando.log.info('Initializing init framework');

    // Add init to lando
    lando.init = require('./init')(lando);

  });

  // Add github init method
  lando.events.on('post-bootstrap', function(lando) {
    lando.init.add('github', require('./methods/github')(lando));
  });

  // Go through our init methods and log them
  lando.events.on('post-bootstrap', 9, function(lando) {

    // Load the init task here because its special
    lando.tasks.add('init', require('./tasks/init')(lando));

    // Log
    _.forEach(lando.init.get(), function(method) {
      lando.log.verbose('Init method %s loaded', method);
    });

  });

};
