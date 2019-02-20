'use strict';

const _ = require('lodash');
const utils = require('./../lib/utils');

module.exports = lando => ({
  command: 'config',
  level: 'tasks',
  describe: 'Displays the lando configuration',
  options: _.merge(utils.formattedOptions, {
    field: {
      describe: 'Show only a specific field',
      alias: ['f'],
      string: true,
    },
  }),
  run: options =>
    utils.outputFormatted(
      options.field ? _.pick(lando.config, options.field) : lando.config,
      options.path,
      options.format
    ),
});
