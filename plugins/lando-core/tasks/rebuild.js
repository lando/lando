'use strict';

module.exports = lando => {
  // Modules
  const _ = lando.node._;
  const chalk = lando.node.chalk;
  const path = require('path');
  const table = lando.cli.makeTable();
  const utils = require('./../lib/utils');

  // The task object
  return {
    command: 'rebuild [appname]',
    describe: 'Rebuilds app in current directory or [appname]',
    options: {
      services: {
        describe: 'Rebuild only the specified services',
        alias: ['s'],
        array: true,
      },
      yes: {
        describe: 'Auto answer yes to prompts',
        alias: ['y'],
        default: false,
        boolean: true,
        interactive: {
          type: 'confirm',
          default: false,
          message: 'Are you sure you want to rebuild?',
        },
      },
    },
    run: options => {
      // Stop rebuild if user decides its a nogo
      if (!options.yes) {
        console.log(chalk.yellow('Rebuild aborted'));
        return;
      }

      // Try to get our app
      // @TODO: handle the appname if passed in?
      const file = path.resolve(process.cwd(), lando.config.landoFile);
      const app = lando.getApp(file);

      // Rebuild the app
      if (app) {
        // Rebuild only particlar services if specified
        if (!_.isEmpty(options.services)) {
          app.opts.services = options.services;
        }

        // Rebuild
        return app.rebuild().then(() => {
          // Header it
          console.log(lando.cli.makeArt());
          // Inject start table into the table
          _.forEach(utils.startTable(app), (value, key) => {
            const opts = (_.includes(key, 'url')) ? {arrayJoiner: '\n'} : {};
            table.add(_.toUpper(key), value, opts);
          });
          // Print the table
          console.log(table.toString());
          console.log('');
        });
      }
    },
  };
};
