'use strict';

// Modules
const _ = require('lodash');
const path = require('path');
const utils = require('./../lib/utils');

// Data
const eventsFile = path.resolve(__dirname, '..', 'data', 'events.yml');

/*
 * Retrieve contributors
 */
module.exports = (api, handler) => {
  // All contributors
  api.get('/v1/events', handler((req, res) => {
    return utils.loadFile(eventsFile) || [];
  }));

  // Contributors by type
  api.get('/v1/events/:type', handler((req, res) => {
    return _.filter(utils.loadFile(eventsFile), {type: req.params.type});
  }));
};
