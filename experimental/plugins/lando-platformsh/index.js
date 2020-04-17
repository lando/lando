'use strict';

// Modules
const _ = require('lodash');
const path = require('path');

module.exports = lando => {
  // Switch the default service for the ssh command if its used
  lando.events.on('cli-ssh-run', data => {
    if (_.get(data, 'options._app.recipe') === 'platformsh' && data.options.service === 'appserver') {
      // @TODO: This needs to handle multiapp at some point
      // @TODO: probably want a util to grab all the platform stuff as well
      const pshConfig = lando.yaml.load(path.join(data.options._app.root, '.platform.app.yaml'));
      const defaultSshService = _.get(pshConfig, 'name', 'app');
      data.options.service = defaultSshService;
      data.options.s = defaultSshService;
    }
  });
};
