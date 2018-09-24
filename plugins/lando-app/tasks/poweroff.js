'use strict';

module.exports = lando => {
  // Modules
  const chalk = lando.node.chalk;
  // The task object
  // @TODO: change this to also grab non app containers
  return {
    command: 'poweroff',
    describe: 'Spin down all lando related containers',
    run: () => {
      // Start
      console.log(chalk.yellow('Spinning containers down... Standby.'));
      // Get all our apps
      return lando.app.list()
      // SHUT IT ALL DOWN
      .map(app => lando.app.get(app.name).then(app => lando.app.stop(app)))
      // Emit poweroff
      .then(() => lando.events.emit('poweroff'))
      // Finish up
      .then(() => {
        console.log(chalk.red('Lando containers have been spun down.'));
      });
    },
  };
};
