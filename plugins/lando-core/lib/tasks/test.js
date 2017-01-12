'use strict';

/**
 * This contains all the core commands that kalabox can run on every machine
 */

module.exports = function(lando) {

  return {
    command: 'test',
    describe: 'test sumptin',
    handler: function() {
      return lando.engine.up();
    }
  };

};
