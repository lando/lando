'use strict';

// Modules
const _ = require('lodash');

module.exports = {
  name: 'acquia',
  parent: '_drupaly',
  config: {
    confSrc: __dirname,
    defaultFiles: {},
    php: '7.4',
    drush: '^10',
  },
  builder: (parent, config) => class LandoDrupal9 extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      options.drush = false;
      options.database = 'mysql:5.7';
      // Load .env file.
      options.env_file = ['.env'];
      // Set build steps for app server.
      options.services = {
        appserver: {
          build: [
            'curl -OL https://github.com/acquia/cli/releases/latest/download/acli.phar',
            'chmod +x acli.phar',
            'mv acli.phar /usr/local/bin/acli',
            '/usr/local/bin/acli auth:login -k $ACLI_KEY -s $ACLI_SECRET -n',
          ],
        },
      };
      // Add acli tooling.
      options.tooling = {
        'acli': {
          service: 'appserver',
          description: 'Run the Acquia acli command',
          cmd: 'acli',
        },
      };
      super(id, options);
    };
  },
};
