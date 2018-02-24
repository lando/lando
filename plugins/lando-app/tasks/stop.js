'use strict';

module.exports = function(lando) {

  // Modules
  var chalk = lando.node.chalk;

  // The task object
  return {
    command: 'stop [appname]',
    describe: 'Stops app in current directory or [appname]',
    run: function(options) {

      // Try to get the app
      return lando.app.get(options.appname)

      // Restart the app
      .then(function(app) {
        if (app) {
          return lando.app.stop(app)
          .then(function() {
            console.log(chalk.red('App stopped!'));
          });
        }
        // Warn user we couldn't find an app
        else {
          lando.log.warn('Could not find app in this dir');
        }
      });

    }
  };

};
