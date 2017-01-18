/**
 * Command to start a lando app
 *
 * @name stop
 */

'use strict';

module.exports = function(lando) {

  // Restart the app
  return {
    command: 'start [appname]',
    describe: 'Start app in current directory or [appname] if given',
    run: function(options) {

      // Try to get the app
      return lando.app.get(options.appname)

      // Start the app
      .then(function(app) {
        if (app) {
          return lando.app.start(app);
        }
      });

    }
  };

};
