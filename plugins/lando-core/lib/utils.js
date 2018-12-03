'use strict';

// Modules
const _ = require('lodash');
const chalk = require('yargonaut').chalk();

/*
 * Returns a normal default interactive confirm with custom message
 */
exports.buildConfirm = (message = 'Are you sure?') => ({
  describe: 'Auto answer yes to prompts',
  alias: ['y'],
  default: false,
  boolean: true,
  interactive: {
    type: 'confirm',
    default: false,
    message: message,
  },
});

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
exports.appToggle = (app, toggle = 'start', table, header = '') => app[toggle]().then(() => {
  // Header it
  console.log(header);
  // Inject start table into the table
  _.forEach(exports.startTable(app), (value, key) => {
    const opts = (_.includes(key, 'urls')) ? {arrayJoiner: '\n'} : {};
    table.add(_.toUpper(key), value, opts);
  });
  // Print the table
  console.log(table.toString());
  console.log('');
});

