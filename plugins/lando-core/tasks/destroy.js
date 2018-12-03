'use strict';

const path = require('path');

module.exports = lando => {
  const chalk = lando.node.chalk;
  return {
    command: 'destroy',
    describe: 'Destroys your app',
    options: {
      yes: {
        describe: 'Auto answer yes to prompts',
        alias: ['y'],
        default: false,
        boolean: true,
        interactive: {
          type: 'confirm',
          default: false,
          message: 'Are you sure you want to DESTROY?',
        },
      },
    },
    run: options => {
      // Stop rebuild if user decides its a nogo
      if (!options.yes) {
        console.log(chalk.yellow('DESTRUCTION AVERTED!'));
        return;
      }
      // Try to get our app
      const app = lando.getApp(path.resolve(process.cwd(), lando.config.landoFile));
      console.log((chalk.green(`Preparing to resign ${app.name} to the dustbin of history...`)));
      // Destroy the app
      if (app) {
        return app.destroy().then(() => {
          console.log(chalk.red('Your app has paid the IRON PRICE. App destroyed!'));
        });
      }
    },
  };
};
