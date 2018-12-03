'use strict';

// Modules
const _ = require('lodash');
const chalk = require('yargonaut').chalk();
const path = require('path');

/*
 * Returns a CLI table with app start metadata info
 */
exports.startTable = app => {
  // Spin up collectors
  const data = {};
  const urls = {};

  // Add generic data
  data.name = app.name;
  data.location = app.root;
  data.services = app.services;

  // Categorize and colorize URLS if and as appropriate
  _.forEach(app.info, info => {
    if (_.has(info, 'urls') && !_.isEmpty(info.urls)) {
      urls[info.service] = _.filter(app.urls, item => {
        item.theme = chalk[item.color](item.url);
        return _.includes(info.urls, item.url);
      });
    }
  });

  // Add service URLS
  _.forEach(urls, (items, service) => {
    data[service + ' urls'] = _.map(items, 'theme');
  });

  // Return data
  return data;
};

/*
 * A toggle to either start or restart
 */
exports.startToggle = (lando, toggle = 'start', message = 'Let\'s get this party started! Starting app..') => ({
  command: toggle,
  describe: 'Restarts your app',
  run: options => {
    const table = lando.cli.makeTable();
    // Try to get our app
    const app = lando.getApp(path.resolve(process.cwd(), lando.config.landoFile));
    console.log(chalk.green(message));
    // Restart it if we can!
    if (app) {
      return app[toggle]().then(() => {
        // Header it
        console.log(lando.cli.makeArt());
        // Inject start table into the table
        _.forEach(exports.startTable(app), (value, key) => {
          const opts = (_.includes(key, 'urls')) ? {arrayJoiner: '\n'} : {};
          table.add(_.toUpper(key), value, opts);
        });
        // Print the table
        console.log(table.toString());
        console.log('');
      });
    }
  },
});
