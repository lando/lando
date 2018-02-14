'use strict';

module.exports = function(lando) {

  // Add core commands to lando
  lando.events.on('post-bootstrap', function(lando) {

    // Log
    lando.log.info('Initializing core plugin');

    // Add the tasks command
    lando.tasks.add('config', require('./tasks/config')(lando));
    lando.tasks.add('version', require('./tasks/version')(lando));

  });

};
