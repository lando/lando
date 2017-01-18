/**
 * Poweroff all kalabox containers
 *
 * @name poweroff
 */

'use strict';

module.exports = function(lando) {

  // The task object
  // @TODO: change this to grab all containers
  return {
    command: 'poweroff',
    describe: 'Spin down all lando related containers',
    run: function() {
      return lando.engine.down();
    }
  };

};
