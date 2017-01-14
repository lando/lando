/**
 * Command to destroy a lando app
 *
 * @name destroy
 */

'use strict';

module.exports = function(lando) {

  return {
    command: 'destroy [appname]',
    describe: 'Destroy app in current directory or [appname] if given',
    handler: function(argv) {

      return lando.app.get(argv.appname)

      .then(function(app) {
        if (app) {
          return lando.app.destroy(app);
        }
      });

    }
  };

};
