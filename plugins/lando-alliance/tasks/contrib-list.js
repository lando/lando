'use strict';

// Modules
const _ = require('lodash');
const LandoApiClient = require('./../lib/api');

module.exports = lando => ({
  command: 'contrib:list',
  level: 'tasks',
  describe: 'List Lando Contributors',
  options: {
    filter: {
      describe: 'Filter by "key=value"',
      alias: ['f'],
      array: true,
    },
  },
  run: options => {
    const api = new LandoApiClient(lando.log);
    console.log(api.read('contributors', _(options.filter).map(filter => filter.split('=')).fromPairs().value()));
  },
});
