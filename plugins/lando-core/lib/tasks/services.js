'use strict';

/**
 * This contains all the core commands that kalabox can run on every machine
 */

module.exports = function(kbox) {

  kbox.core.events.on('post-app-load', function(app) {
    app.events.on('load-tasks', function() {
      kbox.tasks.add(function(task) {
        task.path = [app.name, 'services'];
        task.category = 'appAction';
        task.description = 'Display connection info for services.';
        task.func = function(done) {

          // Get our services info
          return kbox.app.services(app)

          // And then print it
          .then(function(services) {
            console.log(JSON.stringify(services, null, 2));
          })

          // Finish
          .nodeify(done);

        };
      });
    });
  });

};
