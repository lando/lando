'use strict';

/**
 * This contains all the core commands that kalabox can run on every machine
 */

module.exports = function(lando) {

  return {
    command: 'version',
    describe: 'Display the lando version',
    handler: function() {
      console.log('v' + lando.config.version);
    }
  };

};
