const _ = require('lodash');
const path = require('path');
const utils = require('./../lib/utils');

const contributorsFile = path.resolve(__dirname, '..', 'data', 'contributors.yml');

/*
 * Helper to get
 */

module.exports = (api, handler) => {
  api.get('/v1/contributors', handler((req, res) => {
    return utils.loadFile(contributorsFile) || [];
  }));
  api.get('/v1/contributors/:type', handler((req, res) => {
    return _.filter(utils.loadFile(contributorsFile), {type: req.params.type});
  }));
};
