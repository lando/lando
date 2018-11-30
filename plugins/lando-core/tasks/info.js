'use strict';

module.exports = lando => {
  // Task object
  return {
    command: 'info',
    describe: 'Prints info about your app',
    options: {
      deep: {
        describe: 'Get ALL the info',
        alias: ['d'],
        default: false,
        boolean: true,
      },
    },
    run: options => {
      // Try to get the app
      return lando.app.get(options.appname)

      // GEt the app info
      .then(app => {
        if (app) {
          // If this is deep, go deep
          if (options.deep) {
            return lando.engine.list(app.name).each(container => lando.engine.scan(container).then(data => {
              console.log(JSON.stringify(data, null, 2));
            }));
          } else {
            return lando.app.info(app)
            .then(function(info) {
              console.log(JSON.stringify(info, null, 2));
            });
          }
        } else {
          lando.log.warn('Could not find app in this dir');
        }
      });
    },
  };
};
