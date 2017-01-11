'use strict';

/**
 * Poweroff all the kalabox containers
 */

module.exports = function(kbox) {

  // Npm modules
  var chalk = require('chalk');

  // Spin down all kalabox related containers
  kbox.tasks.add(function(task) {

    task.path = ['poweroff'];
    task.description = 'Spin down all Kalabox related containers.';
    task.func = function() {

      // Inform final status
      kbox.core.events.on('post-engine-down', 9, function(done) {
        console.log(chalk.red('Kalabox containers have been spun down.'));
        done();
      });

      // Kick off message
      kbox.core.events.on('pre-engine-down', 1, function(done) {
        console.log(chalk.yellow('Spinning containers down... Standby.'));
        done();
      });

      return kbox.engine.down();

    };
  });

};
