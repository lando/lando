'use strict';

const path = require('path');
const chalk = require('chalk');
const utils = require('./../lib/utils');

module.exports = lando => {
  const table = lando.cli.makeTable();
  return {
    command: 'restart',
    describe: 'Restarts your app',
    run: options => {
      // Message
      // Try to get our app
      const app = lando.getApp(path.resolve(process.cwd(), lando.config.landoFile));
      // Restart it if we can!
      if (app) {
        console.log(chalk.green('Stopping your app... just so we can start it up again ¯\\_(ツ)_/¯'));
        return utils.appToggle(app, 'restart', table, lando.cli.makeArt());
      }
    },
  };
};
