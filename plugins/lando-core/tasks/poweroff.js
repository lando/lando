'use strict';

// Modules
const chalk = require('chalk');

module.exports = lando => {
  return {
    command: 'poweroff',
    level: 'engine',
    describe: 'Spins down all lando related containers',
    options: {
      exclude: {
        describe: 'Exclude containers from one or more apps from being shut down',
        alias: ['e'],
        default: [],
        array: true,
      },
    },
    run: options => {
      // Alert the user to what we're doing based on if any excludes were provided
      const message = options.exclude.length
        ? 'Excluded apps detected. Spinning other Lando containers down... Global containers will be skipped.'
        : 'NO!! SHUT IT ALL DOWN! Spinning Lando containers down...';

      console.log(chalk.green(message));

      // Get all our containers
      return lando.engine.list()
      // If we have any excludes, filter them and any global containers (e.g. proxy) out
      .filter(container =>
        options.exclude.length
          ? !options.exclude.includes(container.app) && container.app !== '_global_'
          : true
      )
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
