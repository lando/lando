'use strict';

const _ = require('lodash');
const chalk = require('chalk');
const utils = require('./../lib/utils');

// Helper to handle options
const handleOpts = options => {
  if (!_.isEmpty(options.services)) return {services: options.services};
  else return {};
};

module.exports = lando => {
  const table = lando.cli.makeTable();
  return {
    command: 'rebuild',
    describe: 'Rebuilds your app from scratch, preserving data',
    options: {
      services: {
        describe: 'Rebuild only the specified services',
        alias: ['s'],
        array: true,
      },
      yes: utils.buildConfirm('Are you sure you want to rebuild?'),
    },
    run: options => {
      if (!options.yes) {
        console.log(chalk.yellow('Rebuild aborted'));
        return;
      }
      // Try to get our app
      const app = lando.getApp(options._app.root);
      // Rebuild the app
      if (app) {
        console.log(chalk.green('Rising anew like a fire phoenix from the ashes! Rebuilding app...'));
        app.opts = handleOpts(options);
        return utils.appToggle(app, 'rebuild', table, lando.cli.makeArt());
      }
    },
  };
};
