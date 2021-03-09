'use strict';

const _ = require('lodash');
const {getAcquiaPull} = require('./../../lib/pull');
const {getAcquiaPush} = require('./../../lib/push');

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
      const group = options._app.config.config.ah_site_group;
      options.services = {
        appserver: {
          build: [
            `mkdir -p /var/www/site-php/${group}`,
            `cp /helpers/acquia-settings.inc /var/www/site-php/${group}/${group}-settings.inc`,
            '/helpers/acquia-config-symlink.sh',
          ],
          environment: {
            AH_SITE_UUID: options._app.config.config.ah_application_uuid || null,
            AH_SITE_GROUP: options._app.config.config.ah_site_group || null,
            AH_SITE_ENVIRONMENT: 'LANDO',
          },
        },
        mailhog: {
          type: 'mailhog',
        },
        memcached: {
          type: 'memcached',
        },
      };

      // Install acli from either 1) latest download, 2) A specific version, or 3) build from a branch
      // TODO: switch default to `latest` once acli catches up.
      const acliVersionDefault = 'master';
      const acliVersion = options._app.config.config.acli_version ?
        options._app.config.config.acli_version : acliVersionDefault;
      const regexVersion = /^[0-9]+\.[0-9]+\.[0-9]+$/g;
      let acliDownload = null;
      if (acliVersion === 'latest') {
        acliDownload = 'https://github.com/acquia/cli/releases/latest/download/acli.phar';
      } else if (acliVersion.match(regexVersion)) {
        acliDownload = `https://github.com/acquia/cli/releases/download/${acliVersion}/acli.phar`;
      }
      // Download release
      if (acliDownload !== null) {
        options.services.appserver.build.push(...[
          'curl -OL https://github.com/acquia/cli/releases/latest/download/acli.phar',
          'chmod +x acli.phar',
          'mv acli.phar /usr/local/bin/acli',
        ]);
      } else {
        // Build from source
        options.services.appserver.build.push(...[
          'rm -rf /usr/local/cli',
          `cd /usr/local/ && git clone git@github.com:acquia/cli.git -b "${acliVersion}" && cd cli && composer install`,
          'ln -s /usr/local/cli/bin/acli /usr/local/bin/acli',
        ]);
      }

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

      // Install composer deps
      options.services.appserver.build.push('cd /app && /usr/local/bin/acli pull:run-scripts');

      // Add acli tooling.
      options.tooling = {
        'acli': {
          service: 'appserver',
          description: 'Run the Acquia acli command',
          cmd: 'acli',
        },
        'pull': getAcquiaPull(options),
        'push': getAcquiaPush(options),
      };
      super(id, options);
    };
  },
};
