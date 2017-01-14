/**
 * Poweroff all kalabox containers
 *
 * @name poweroff
 */

'use strict';

module.exports = function(lando) {

  return {
    command: 'poweroff',
    describe: 'Spin down all lando related containers',
    handler: function() {
      return lando.engine.down();
    }
  };

};
