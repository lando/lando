'use strict';

module.exports = lando => {
  // Add core commands to lando
  lando.events.on('post-bootstrap', lando => {
    // Log
    lando.log.info('Initializing core plugin');
    // Add the tasks command
    lando.tasks.add('config', require('./tasks/config')(lando));
    lando.tasks.add('version', require('./tasks/version')(lando));
  });
};
