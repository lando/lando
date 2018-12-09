'use strict';

const path = require('path');

module.exports = lando => {
  const chalk = lando.node.chalk;
  return {
    command: 'stop',
    describe: 'Stops your app',
    run: options => {
      // Try to get our app
      const app = lando.getApp(path.resolve(process.cwd(), lando.config.landoFile));
      // Stop it if we can!
      if (app) {
        console.log(chalk.green('This party\'s over :( Stopping app'));
        return app.stop().then(() => console.log(chalk.red('App stopped!')));
      }
    },
  };
};
