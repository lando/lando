/**
 * Command to stop a lando app
 *
 * @name stop
 */

'use strict';

module.exports = function() {

  return {
    command: 'stop [appname]',
    describe: 'Stops app in current directory or [appname] if given',
    handler: function(argv) {

      console.log(argv);

    }
  };

};
