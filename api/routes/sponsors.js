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
    return utils.loadFile(sponsorsFile)[req.params.type] || res.redirect('/sponsors');
  }));
};
