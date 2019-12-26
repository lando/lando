const _ = require('lodash');
const path = require('path');
const utils = require('./../lib/utils');

const contributorsFile = path.resolve(__dirname, '..', 'data', 'contributors.yml');

/*
 * Retrieve contributors
 */
module.exports = (api, handler) => {
  // All contributors
  api.get('/v1/contributors', handler((req, res) => {
    return utils.loadFile(contributorsFile) || [];
  }));

  // Contributors by type
  api.get('/v1/contributors/:type', handler((req, res) => {
    return _.filter(utils.loadFile(contributorsFile), {type: req.params.type});
  }));
};
