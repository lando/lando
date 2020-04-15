'use strict';

// Modules
const _ = require('lodash');

module.exports = lando => {
  // Switch the default service for the ssh command if its used
  lando.events.on('cli-ssh-run', data => {
    if (_.get(data, 'options._app.recipe') === 'lagoon' && data.options.service === 'appserver') {
      data.options.service = 'cli';
      data.options.s = 'cli';
    }
  });
};
