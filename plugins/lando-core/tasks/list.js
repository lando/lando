'use strict';

// Modules
const _ = require('lodash');
const util = require('util');

module.exports = lando => {
  return {
    command: 'list',
    describe: 'Lists all running lando apps and containers',
    level: 'engine',
    run: () => {
      // List all the apps
      return lando.engine.list()
      // Map each app to a summary and print results
      .then(containers => {
        console.log(util.inspect(_(containers)
          .map(container => _.omit(container, ['lando', 'id', 'instance']))
          .groupBy('app')
          .value(), {colors: true, depth: 10, compact: false}));
      });
    },
  };
};
