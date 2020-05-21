'use strict';

// Modules
const _ = require('lodash');
const path = require('path');

module.exports = lando => {
  // Switch the default service for the ssh command if its used
  lando.events.on('cli-ssh-run', data => {
    if (_.get(data, 'options._app.recipe') === 'platformsh' && data.options.service === 'appserver') {
      // Reset the default service from appserver to whatever the first app name is
      // @TODO: This needs to handle multiapp at some point
      const pshConfig = lando.yaml.load(path.join(data.options._app.root, '.platform.app.yaml'));
      const defaultSshService = _.get(pshConfig, 'name', 'app');
      data.options.service = defaultSshService;
      data.options.s = defaultSshService;

      // Reset the default command if needed
      if (!_.has(data, 'options.command')) {
        data.options.command = 'if ! type bash > /dev/null; then sh; else bash; fi';
      }

      // Wrap commands in /helpers/execute.sh
      data.options.command = ['/helpers/execute.sh', '/bin/sh', '-c', data.options.command];
    }
  });
};
