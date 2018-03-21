'use strict';

module.exports = function(lando) {

  /*
   * Helper function to build some summary info for our apps
   */
  var appSummary = function(app) {

    // Chcek if our app is running
    return lando.app.isRunning(app)

    // Return a nice app summary
    .then(function(isRunning) {
      return {
        name: app.name,
        location: app.dir,
        running: isRunning
      };
    });

  };

  return {
    command: 'list',
    describe: 'List all lando apps',
    run: function() {

      // List all the apps
      return lando.app.list()

      // Map each app to a summary and print results
      .map(function(app) {
        return appSummary(app);
      }).then(function(summary) {
          console.log(JSON.stringify(summary, null, 2));
      });

    }
  };

};
