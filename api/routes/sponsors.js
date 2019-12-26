const _ = require('lodash');
const path = require('path');
const utils = require('./../lib/utils');

const sponsorsFile = path.resolve(__dirname, '..', 'data', 'sponsors.yml');

/*
 * Retrieve contributors
 */
module.exports = (api, handler) => {
  // All sponsors
  api.get('/v1/sponsors', handler((req, res) => {
    return utils.loadFile(sponsorsFile) || [];
  }));

  // By type
  api.get('/v1/sponsors/:type', handler((req, res) => {
    return _.filter(utils.loadFile(sponsorsFile), {type: req.params.type});
  }));
};
