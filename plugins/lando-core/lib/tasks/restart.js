/**
 * Command to restop a lando app
 *
 * @name restop
 */

'use strict';

module.exports = function(lando) {

  // Task object
  return {
    command: 'restart [appname]',
    describe: 'Restarts app in current directory or [appname] if given',
    run: function(options) {

      // Try to get the app
      return lando.app.get(options.appname)

      // Resttart the app
      .then(function(app) {
        if (app) {
          return lando.app.restart(app);
        }
      });

    }
  };

};
