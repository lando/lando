'use strict';

const _ = require('lodash');
const {getAcquiaPull} = require('./../../lib/pull');

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
            // TODO: Uncomment when production release of acli is in use again (json format is resolved)
            // 'curl -OL https://github.com/acquia/cli/releases/latest/download/acli.phar',
            // 'chmod +x acli.phar',
            // 'mv acli.phar /usr/local/bin/acli',
            `mkdir -p /var/www/site-php/${group}`,
            `cp /helpers/settings.inc /var/www/site-php/${group}/${group}-settings.inc`,
            '/helpers/acquia-config-symlink.sh',
            // TODO: Remove when production release of acli is in use again
            'rm -rf /usr/local/cli',
            'cd /usr/local/ && git clone git@github.com:acquia/cli.git && cd cli && composer install',
            'ln -s /usr/local/cli/bin/acli /usr/local/bin/acli',
          ],
          environment: {
            AH_SITE_UUID: options._app.config.config.ah_id || null,
            AH_SITE_GROUP: options._app.config.config.ah_group || null,
            AH_SITE_ENVIRONMENT: 'LANDO',
          },
        },
        memcached: {
          type: 'memcached',
        },
      };

      // Run acli login with credentials set in init; if applicable
      const lastInitData = options._app._lando.cache.get('acquia.last');
      if (lastInitData) {
        const key = lastInitData['acquia-key'];
        const sec = lastInitData['acquia-secret'];
        const cmd = `/usr/local/bin/acli auth:login -k "${key}" -s "${sec}" -n`;
        options.services.appserver.build.push(cmd);
        // Delete the evidence
        options._app._lando.cache.set('acquia.last', null, {persist: true});
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
