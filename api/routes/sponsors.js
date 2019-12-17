const _ = require('lodash');
const path = require('path');
const utils = require('./../lib/utils');

const sponsorsFile = path.resolve(__dirname, '..', 'data', 'sponsors.yml');

/*
 * Helper to get
 */

module.exports = (api, handler) => {
  api.get('/v1/sponsors', handler((req, res) => {
    return utils.loadFile(sponsorsFile);
  }));
  api.get('/v1/sponsors/:type', handler((req, res) => {
    return _.filter(utils.loadFile(sponsorsFile), {type: req.params.type});
  }));
};
