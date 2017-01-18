/**
 * This contains all the core commands that kalabox can run on every machine
 *
 * @name tasks
 */

'use strict';

module.exports = function(lando) {

  // Load in all our commands
  lando.events.on('post-bootstrap', 1, function(lando) {
    //lando.tasks.addTask('config', require('./tasks/config')(lando));
    //lando.tasks.addTask('destroy', require('./tasks/destroy')(lando));
    //lando.tasks.addTask('list', require('./tasks/list')(lando));
    //lando.tasks.addTask('poweroff', require('./tasks/poweroff')(lando));
    lando.tasks.addTask('rebuild', require('./tasks/rebuild')(lando));
    //lando.tasks.addTask('restart', require('./tasks/restart')(lando));
    //lando.tasks.addTask('start', require('./tasks/start')(lando));
    //lando.tasks.addTask('stop', require('./tasks/stop')(lando));
    //lando.tasks.addTask('version', require('./tasks/version')(lando));
  });

};
