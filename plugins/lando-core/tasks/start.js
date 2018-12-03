'use strict';

const path = require('path');
const utils = require('./../lib/utils');

module.exports = lando => {
  const chalk = lando.node.chalk;
  const table = lando.cli.makeTable();
  return {
    command: 'start',
    describe: 'Starts your app',
    run: options => {
      // Try to get our app
      const app = lando.getApp(path.resolve(process.cwd(), lando.config.landoFile));
      console.log(chalk.green('Let\'s get this party started! Starting app..'));
      // Start it if we can!
      if (app) return utils.appToggle(app, 'start', table, lando.cli.makeArt());
    },
  };
};
