/**
 * Command to print out the config
 *
 * @name config
 */

'use strict';

module.exports = function(lando) {

  return {
    command: 'config',
    describe: 'Display the lando configuration',
    handler: function() {
      console.log(JSON.stringify(lando.config, null, 2));
    }
  };

};
