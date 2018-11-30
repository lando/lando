'use strict';

module.exports = lando => {
  const _ = lando.node._;
  return {
    command: 'list',
    describe: 'Lists all running lando apps and containers',
    run: () => {
      // List all the apps
      return lando.engine.list()
      // Map each app to a summary and print results
      .then(containers => {
        console.log(_(containers)
          .map(container => _.omit(container, ['lando', 'id', 'instance']))
          .groupBy('app')
          .value());
      });
    },
  };
};
