/**
 * Command to restop a lando app
 *
 * @name restop
 */

'use strict';

module.exports = function(lando) {

  return {
    command: 'rebuild [appname]',
    describe: 'Rebuilds app in current directory or [appname] if given',
    handler: function(argv) {

      return lando.app.get(argv.appname)

      .then(function(app) {
        if (app) {
          return lando.app.rebuild(app);
        }
      });

    }
  };

};
