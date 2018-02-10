'use strict';

module.exports = function(lando) {

  // Modules
  var chalk = lando.node.chalk;

  // The task object
  // @TODO: change this to also grab non app containers
  return {
    command: 'poweroff',
    describe: 'Spin down all lando related containers',
    run: function() {

      // Start
      console.log(chalk.yellow('Spinning containers down... Standby.'));

      // Get all our apps
      return lando.app.list()

      // SHUT IT ALL DOWN
      .map(function(app) {
        return lando.app.get(app.name)
        .then(function(app) {
          lando.app.stop(app);
        });
      })

      // Emit poweroff
      .then(function() {
        return lando.events.emit('poweroff');
      })

      // Finish up
      .then(function() {
        console.log(chalk.red('Lando containers have been spun down.'));
      });

    }
  };

};
