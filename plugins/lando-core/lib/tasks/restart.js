/**
 * Command to restop a lando app
 *
 * @name restart
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var chalk = lando.node.chalk;

  // Task object
  return {
    command: 'restart [appname]',
    describe: 'Restarts app in current directory or [appname]',
    run: function(options) {

      // Try to get the app
      return lando.app.get(options.appname)

      // Resttart the app
      .then(function(app) {
        if (app) {
          return lando.app.restart(app)
          .then(function() {
            console.log(chalk.green('App restarted!'));
          });
        }
      });

    }
  };

};
