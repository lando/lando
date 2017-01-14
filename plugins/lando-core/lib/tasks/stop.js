/**
 * Command to stop a lando app
 *
 * @name stop
 */

'use strict';

module.exports = function(lando) {

  return {
    command: 'stop [appname]',
    describe: 'Stops app in current directory or [appname] if given',
    handler: function(argv) {

      return lando.app.get(argv.appname)

      .then(function(app) {
        if (app) {
          return lando.app.stop(app);
        }
      });

    }
  };

};
