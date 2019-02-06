'use strict';

const _ = require('lodash');
const util = require('util');

module.exports = lando => ({
  command: 'config',
  level: 'tasks',
  describe: 'Displays the lando configuration',
  options: {
    field: {
      describe: 'Show only a specific field',
      alias: ['f'],
      string: true,
    },
  },
  run: options => {
    const inspectOpts = {colors: true, depth: 10, compact: false};
    if (options.field) console.log(util.inspect(_.pick(lando.config, options.field), inspectOpts));
    else console.log(util.inspect(lando.config, inspectOpts));
  },
});
