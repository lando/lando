'use strict';

const _ = require('lodash');

// Helper to filter services
const filterServices = (service, services = []) => {
  return !_.isEmpty(services) ? _.includes(services, service) : true;
};

module.exports = lando => ({
  command: 'info',
  describe: 'Prints info about your app',
  options: _.merge({}, lando.cli.formatOptions(), {
    deep: {
      describe: 'Get ALL the info',
      alias: ['d'],
      default: false,
      boolean: true,
    },
    service: {
      describe: 'Get info for only the specified services',
      alias: ['s'],
      array: true,
    },
  }),
  run: options => {
    // Try to get our app
    const app = lando.getApp(options._app.root);
    // Get services
    app.opts = (!_.isEmpty(options.service)) ? {services: options.service} : {};
    // Go deep if we need to
    if (app && options.deep) {
      return app.init().then(() => lando.engine.list({project: app.project})
        .filter(container => filterServices(container.service, options.service))
        .each(container => lando.engine.scan(container)
          .then(data => console.log(lando.cli.formatData(data, options))))
        );
    } else if (app && !options.deep) {
      return app.init().then(() => console.log(lando.cli.formatData(
        _.filter(app.info, service => filterServices(service.service, options.service)),
        options
      )));
    }
  },
});
