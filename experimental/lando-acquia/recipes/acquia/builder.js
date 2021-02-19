'use strict';

// Modules
const _ = require('lodash');
const {getAcquiaPull} = require('./../../lib/pull');

const acquiaLastInitCache = 'acquia.last';

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
      options.webroot = 'docroot';

      // Set build steps for app server.
      const group = options._app.config.config.ah_group;
      options.services = {
        appserver: {
          build: [
            'curl -OL https://github.com/acquia/cli/releases/latest/download/acli.phar',
            'chmod +x acli.phar',
            'mv acli.phar /usr/local/bin/acli',
            `mkdir -p /var/www/site-php/${group}`,
            `cp /helpers/settings.inc /var/www/site-php/${group}/${group}-settings.inc`,
          ],
          environment: {
            AH_SITE_UUID: options._app.config.config.ah_id || null,
            AH_SITE_GROUP: options._app.config.config.ah_group || null,
          },
        },
        memcached: {
          type: 'memcached',
        },
      };

      // Add key and secret from last init.
      const lastInitData = options._app._lando.cache.get(acquiaLastInitCache);
      if (lastInitData) {
        const key = lastInitData['acquia-key'];
        const sec = lastInitData['acquia-secret'];
        const cmd = `/usr/local/bin/acli auth:login -k "${key}" -s "${sec}" -n`;

        options.services.appserver.build.push(cmd);
        // Delete because the token will exist on a rebuild, and if
        // they change the token for some reason, we need that one to be used.
        options._app._lando.cache.set(acquiaLastInitCache, null, {persist: true});
      }

      // Add acli tooling.
      options.tooling = {
        'acli': {
          service: 'appserver',
          description: 'Run the Acquia acli command',
          cmd: 'acli',
        },
        'pull': getAcquiaPull(options),
      };
      super(id, options);
    };
  },
};
