'use strict';

const _ = require('lodash');
const utils = require('./../lib/utils');

module.exports = lando => ({
  command: 'config',
  level: 'tasks',
  describe: 'Displays the lando configuration',
  options: _.merge({}, utils.formattedOptions, {
    field: {
      describe: 'Show only a specific field',
      hidden: true,
      string: true,
    },
  }),
  run: options => {
    if (!_.isNil(options.field)) options.path = options.field;
    console.log(utils.outputFormatted(lando.config, options.path, options.format));
  },
});
