/**
 * Command to print info about an app
 *
 * @name info
 */

'use strict';

module.exports = function(lando) {

  // Task object
  return {
    command: 'info [appname]',
    describe: 'Prints info about app in current directory or [appname]',
    run: function(options) {

      // Try to get the app
      return lando.app.get(options.appname)

      // Resttart the app
      .then(function(app) {
        if (app) {
          console.log(JSON.stringify(app.info, null, 2));
        }
      });

    }
  };

};
