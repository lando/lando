/**
 * This contains all the core commands that kalabox can run on every machine
 *
 * @name tasks
 */

'use strict';

module.exports = function(lando) {

  // Load in all our commands
  lando.events.on('cli-load', 1, function(yargs) {
    yargs.command(require('./tasks/config')(lando));
    yargs.command(require('./tasks/test')(lando));
    yargs.command(require('./tasks/version')(lando));
  });

};
