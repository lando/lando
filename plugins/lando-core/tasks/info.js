'use strict';

const util = require('util');
const pp = data => console.log(util.inspect(data, {colors: true, depth: 10, compact: false}));

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
    const app = lando.getApp(options._app.root);
    // Go deep if we need to
    if (app && options.deep) {
      return app.init().then(() => lando.engine.list(app.name).each(container => lando.engine.scan(container)
      .then(data => pp(data))));
    } else if (app && !options.deep) {
      return app.init().then(() => pp(app.info));
    }
  },
});
