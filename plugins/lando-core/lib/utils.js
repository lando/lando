'use strict';

// Modules
const _ = require('lodash');
const chalk = require('yargonaut').chalk();

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
  _.forEach(app.info, (info, service) => {
    if (_.has(info, 'urls') && !_.isEmpty(info.urls)) {
      urls[service] = _.filter(app.urls, item => {
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
