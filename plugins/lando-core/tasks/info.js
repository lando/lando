'use strict';

const path = require('path');

module.exports = lando => ({
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
    // Go deep if we need to
    if (app && options.deep) {
      return app.init().then(() => lando.engine.list(app.name).each(container => lando.engine.scan(container)
      .then(data => console.log(data))));
    } else if (app && !options.deep) {
      return app.init().then(() => console.log(app.info));
    }
  },
});
