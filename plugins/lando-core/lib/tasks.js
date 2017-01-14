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
    yargs.command(require('./tasks/destroy')(lando));
    yargs.command(require('./tasks/list')(lando));
    yargs.command(require('./tasks/poweroff')(lando));
    yargs.command(require('./tasks/rebuild')(lando));
    yargs.command(require('./tasks/restart')(lando));
    yargs.command(require('./tasks/start')(lando));
    yargs.command(require('./tasks/stop')(lando));
    yargs.command(require('./tasks/version')(lando));
  });

};
