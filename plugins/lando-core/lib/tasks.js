/**
 * This contains all the core commands that lando can run on every machine
 *
 * @name tasks
 */

'use strict';

module.exports = function(lando) {

  // Load in all our commands
  lando.events.on('post-bootstrap', 1, function(lando) {
    lando.tasks.add('config', require('./tasks/config')(lando));
    lando.tasks.add('destroy', require('./tasks/destroy')(lando));
    lando.tasks.add('info', require('./tasks/info')(lando));
    lando.tasks.add('list', require('./tasks/list')(lando));
    lando.tasks.add('logs', require('./tasks/logs')(lando));
    lando.tasks.add('poweroff', require('./tasks/poweroff')(lando));
    lando.tasks.add('rebuild', require('./tasks/rebuild')(lando));
    lando.tasks.add('restart', require('./tasks/restart')(lando));
    lando.tasks.add('start', require('./tasks/start')(lando));
    lando.tasks.add('stop', require('./tasks/stop')(lando));
    lando.tasks.add('version', require('./tasks/version')(lando));
  });

};
