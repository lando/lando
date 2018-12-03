'use strict';

const path = require('path');
const utils = require('./../lib/utils');

module.exports = lando => {
  const _ = lando.node._;
  const chalk = lando.node.chalk;
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
      // Stop rebuild if user decides its a nogo
      if (!options.yes) {
        console.log(chalk.yellow('Rebuild aborted'));
        return;
      }
      // Try to get our app
      const app = lando.getApp(path.resolve(process.cwd(), lando.config.landoFile));
      // Rebuild only particlar services if specified
      if (!_.isEmpty(options.services)) app.opts.services = options.services;
      // Message
      console.log(chalk.green('Rising anew like a fire phoenix from the ashes! Rebuilding app...'));
      // Rebuild the app
      if (app) return utils.appToggle(app, 'rebuild', table, lando.cli.makeArt());
    },
  };
};
