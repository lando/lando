'use strict';

// Modules
const chalk = require('chalk');

module.exports = lando => {
  return {
    command: 'poweroff',
    level: 'engine',
    describe: 'Spins down all lando related containers',
    run: () => {
      console.log(chalk.green('NO!! SHUT IT ALL DOWN! Spinning Lando containers down...'));
      // Get all our containers
      return lando.engine.list()
      // SHUT IT ALL DOWN
      .each(container => console.log('Bye bye %s ... ', container.name, chalk.green('done')))
      .each(container => lando.engine.stop({id: container.id}))
      // Emit poweroff
      .then(() => lando.events.emit('poweroff'))
      // Finish up
      .then(() => {
        console.log(chalk.red('Lando containers have been spun down.'));
      });
    },
  };
};
