/**
 * This contains all the core commands that kalabox can run on every machine
 */

'use strict';

module.exports = function(lando) {

  return {
    command: 'config',
    describe: 'Display the lando configuration',
    handler: function() {
      console.log(JSON.stringify(lando.config, null, '  '));
    }
  };

};
