'use strict';

module.exports = lando => {
  // Modules
  const chalk = lando.node.chalk;
  const path = require('path');

  // The task object
  return {
    command: 'stop',
    describe: 'Stops your app',
    run: options => {
      // Try to get our app
      const app = lando.getApp(path.resolve(process.cwd(), lando.config.landoFile));
      // Stop it if we can!
      if (app) {
        return app.stop().then(() => {
          console.log(chalk.red('App stopped!'));
        });
      }
    },
  };
};
