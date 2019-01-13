'use strict';

const chalk = require('chalk');

module.exports = lando => ({
  command: 'stop',
  describe: 'Stops your app',
  run: options => {
    // Try to get our app
    const app = lando.getApp(options._app.root);
    // Stop it if we can!
    if (app) {
      console.log(chalk.green('This party\'s over :( Stopping app'));
      return app.stop().then(() => console.log(chalk.red('App stopped!')));
    }
  },
});
