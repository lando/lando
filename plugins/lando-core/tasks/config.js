'use strict';

const util = require('util');

module.exports = lando => ({
  command: 'config',
  level: 'tasks',
  describe: 'Displays the lando configuration',
  run: () => console.log(util.inspect(lando.config, {colors: true, depth: 10, compact: false})),
});
