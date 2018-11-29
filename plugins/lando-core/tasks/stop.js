'use strict';

module.exports = lando => {
  // Modules
  const chalk = lando.node.chalk;
  const path = require('path');

  // The task object
  return {
    command: 'stop [appname]',
    describe: 'Stops app in current directory or [appname]',
    run: options => {
      // Try to get our app
      // @TODO: handle the appname if passed in?
      const file = path.resolve(process.cwd(), lando.config.landoFile);
      const app = lando.getApp(file);

      // Stop it if we can!
      if (app) {
        return app.stop().then(() => {
          console.log(chalk.red('App stopped!'));
        });
      }
    },
  };
};
