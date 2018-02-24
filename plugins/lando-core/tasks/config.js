'use strict';

module.exports = function(lando) {

  // Define our task
  return {
    command: 'config',
    describe: 'Display the lando configuration',
    run: function() {
      console.log(JSON.stringify(lando.config, null, 2));
    }
  };

};
