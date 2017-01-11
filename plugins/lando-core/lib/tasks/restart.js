'use strict';

/**
 * This contains all the core commands that kalabox can run on every machine
 */

module.exports = function(kbox) {

  kbox.core.events.on('post-app-load', function(app) {
    app.events.on('load-tasks', function() {
      kbox.tasks.add(function(task) {
        task.path = [app.name, 'restart'];
        task.category = 'appAction';
        task.description = 'Stop and then start a running kbox application.';
        task.func = function(done) {
          kbox.app.restart(app, done);
        };
      });
    });
  });

};
