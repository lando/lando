'use strict';

// Modules
const _ = require('lodash');
const lagoonConf = require('./lib/config');

// CLI service types
const cliServiceTypes = ['php-cli', 'php-cli-drupal'];

module.exports = lando => {
  // Switch the default service for the ssh command if its used
  lando.events.on('cli-ssh-run', data => {
    if (_.get(data, 'options._app.recipe') === 'lagoon' && data.options.service === 'appserver') {
      // Get lagoon config
      const appRoot = _.get(data, 'options._app.root', process.cwd());
      const config = lagoonConf.loadConfigFiles(appRoot);
      // Find CLI containers
      const cliServices = _(_.get(config, 'compose.services', {}))
        .map((service, name) => _.merge({}, service, {name}))
        .filter(service => _.includes(cliServiceTypes, service.labels['lando.type']))
        .map('name')
        .value();
      // Use the first CLI container we find
      data.options.service = _.first(cliServices);
      data.options.s = _.first(cliServices);
    }
  });
};
