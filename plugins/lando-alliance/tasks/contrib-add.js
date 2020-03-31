'use strict';

// Modules
const _ = require('lodash');
const contrib = require('./../lib/contrib');
const crypto = require('crypto');
const LandoApiClient = require('./../lib/api');

// Consts
const omitKeys = ['_', '_app', '$0', 'email', 'verbose', 'v'];

module.exports = lando => ({
  command: 'contrib:add',
  level: 'tasks',
  describe: 'Adds a new Lando contributor',
  options: contrib.addOptions,
  run: options => {
    const data = _.merge({}, _.omitBy(_.omit(options, omitKeys), _.isEmpty), {
      title: 'Contributor',
      pic: `https://www.gravatar.com/avatar/${crypto.createHash('md5').update(options.email).digest('hex')}`,
    });
    // Add to the contribz
    const api = new LandoApiClient(lando.log);
    console.log('Added the following contributor');
    console.log(lando.cli.formatData(api.update('contributors', data), {format: 'table'}));
  },
});
