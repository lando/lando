'use strict';

const _ = require('lodash');
const utils = require('./../lib/utils');

// Helper to filter services
const filterServices = (service, services = []) => {
  return !_.isEmpty(services) ? _.includes(services, service) : true;
};

module.exports = lando => ({
  command: 'info',
  describe: 'Prints info about your app',
  options: _.merge(utils.formattedOptions, {
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
    app.opts = (!_.isEmpty(options.service)) ? {
      services: options.service
    } : {};
    // Go deep if we need to
    if (app && options.deep) {
      return app.init().then(() => lando.engine.list({
          app: app.name
        })
        .filter(container => filterServices(container.service, options.service))
        .each(container => lando.engine.scan(container)
          .then(data => utils.outputFormatted(data, options.path, options.output))));
    } else if (app && !options.deep) {
      return app.init()
        .then(
          () => utils.outputFormatted(
            _.filter(app.info, service => filterServices(service.service, options.service)),
            options.path,
            options.output
          )
        );
    }
  },
});
