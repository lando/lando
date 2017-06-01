/**
 * Command to test tooling delegation
 *
 * @name stop
 */

'use strict';

module.exports = function(lando) {

  // Test the things
  return {
    command: 'test',
    describe: 'Test a drush command.',
    run: function() {

      // Try to get the app
      return lando.engine.run({
        id: 'lamp_appserver_1',
        cmd: 'bash',
        opts: {mode: 'attach'}
      });

    }
  };

};
