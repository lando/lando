'use strict';

module.exports = function(lando) {

  // Define our task
  return {
    command: 'version',
    describe: 'Display the lando version',
    run: function() {
      console.log('v' + lando.config.version);
    }
  };

};
