'use strict';

module.exports = function(lando) {

  // Task object
  return {
    command: 'info [appname]',
    describe: 'Prints info about app in current directory or [appname]',
    options: {
      deep: {
        describe: 'Get ALL the info',
        alias: ['d'],
        default: false,
        boolean: true
      }
    },
    run: function(options) {

      // Try to get the app
      return lando.app.get(options.appname)

      // GEt the app info
      .then(function(app) {
        if (app) {

          // If this is deep, go deep
          if (options.deep) {
            return lando.engine.list(app.name)
            .each(function(container) {
              return lando.engine.scan(container)
              .then(function(data) {
                console.log(JSON.stringify(data, null, 2));
              });
            });
          }

          // Return the basic info
          else {
            return lando.app.info(app)
            .then(function(info) {
              console.log(JSON.stringify(info, null, 2));
            });
          }

        }

        // Warn user we couldn't find an app
        else {
          lando.log.warn('Could not find app in this dir');
        }
      });

    }
  };

};
