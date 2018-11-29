'use strict';

module.exports = lando => {
  // Modules
  const chalk = lando.node.chalk;
  const path = require('path');

  // The task object
  return {
    command: 'destroy [appname]',
    describe: 'Destroy app in current directory or [appname]',
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
      // @TODO: handle the appname if passed in?
      const file = path.resolve(process.cwd(), lando.config.landoFile);
      const app = lando.getApp(file);

      // Destroy the app
      if (app) {
        return app.destroy().then(() => {
          console.log(chalk.red('Your app has paid the IRON PRICE. App destroyed!'));
        });
      }
    },
  };
};
