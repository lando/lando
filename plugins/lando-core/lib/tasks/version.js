/**
 * Command to show the version
 *
 * @name version
 */

'use strict';

module.exports = function(lando) {

  return {
    command: 'version',
    describe: 'Display the lando version',
    handler: function() {
      console.log('v' + lando.config.version);
    }
  };

};
