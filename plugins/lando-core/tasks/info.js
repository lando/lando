'use strict';

const path = require('path');

module.exports = lando => {
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
      // Try to get our app
      const app = lando.getApp(path.resolve(process.cwd(), lando.config.landoFile));
      // GEt the app info
      if (app) {
        // If this is deep, go deep
        if (options.deep) {
          return app.init().then(() => lando.engine.list(app.name)
            .each(container => lando.engine.scan(container)
            .then(data => {
              console.log(JSON.stringify(data, null, 2));
            })));
        } else {
          return lando.app.inspect(app).then(info => {
            console.log(JSON.stringify(info, null, 2));
          });
        }
      }
    },
  };
};
