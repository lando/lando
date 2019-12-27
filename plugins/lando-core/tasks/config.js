'use strict';

const _ = require('lodash');

module.exports = lando => ({
  command: 'config',
  level: 'tasks',
  describe: 'Displays the lando configuration',
  options: _.merge({}, lando.cli.formatOptions(['filter']), {
    // @NOTE: This is for backwards compat and needs to be removed
    field: {
      describe: 'Show only a specific field',
      hidden: true,
      string: true,
    },
  }),
  run: options => {
    if (!_.isNil(options.field)) options.path = options.field;
    console.log(lando.cli.formatData(lando.config, options, {sort: true}));
  },
});
