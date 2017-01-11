'use strict';

/**
 * This contains all the core commands that kalabox can run on every machine
 */

module.exports = function(kbox) {

  /*
   * Helper function to build some summary info for our apps
   */
  var appSummary = function(app) {

    // Chcek if our app is running
    return kbox.app.isRunning(app)

    // Return a nice app summary
    .then(function(isRunning) {
      return {
        name: app.name,
        url: app.url,
        type: app.config.type,
        version: app.config.version,
        location: app.root,
        running: isRunning
      };
    });

  };

  // Display list of apps.
  kbox.tasks.add(function(task) {
    task.path = ['list'];
    task.description = 'Display list of apps';
    task.options.push({
      name: 'names',
      alias: 'n',
      description: 'Only display app names'
    });
    task.func = function(done) {

      // List all the apps
      return kbox.app.list()

      // Map each app to a summary and print results
      .each(function(app) {
        return appSummary(app)
        .then(function(summary) {
          console.log(JSON.stringify(summary, null, 2));
        });
      })

      // Nodeify the doneness
      .nodeify(done);

    };
  });

};
