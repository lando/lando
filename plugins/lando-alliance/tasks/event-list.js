'use strict';

// Modules
const LandoApiClient = require('./../lib/api');

module.exports = lando => ({
  command: 'event:list',
  level: 'tasks',
  describe: 'List Lando events',
  options: lando.cli.formatOptions(),
  run: options => {
    const api = new LandoApiClient(lando.log);
    console.log(lando.cli.formatData(api.read('events'), options));
  },
});
