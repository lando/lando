'use strict';

module.exports = lando => {
  /*
   * Helper function to build some summary info for our apps
   */
  const appSummary = app => {
    // Chcek if our app is running
    return lando.app.isRunning(app)

    // Return a nice app summary
    .then(isRunning => ({
      name: app.name,
      location: app.dir,
      running: isRunning,
    }));
  };

  return {
    command: 'list',
    describe: 'List all lando apps',
    run: () => {
      // List all the apps
      return lando.app.list()
      // Map each app to a summary and print results
      .map(app => appSummary(app))
      .then(summary => {
        console.log(JSON.stringify(summary, null, 2));
      });
    },
  };
};
