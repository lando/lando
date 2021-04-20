'use strict';

const _ = require('lodash');
const {getAcquiaPull} = require('./../../lib/pull');
const {getAcquiaPush} = require('./../../lib/push');
const utils = require('./../../lib/utils');

module.exports = {
  name: 'acquia',
  parent: '_drupaly',
  config: {
    cache: true,
    composer_version: '2',
    confSrc: __dirname,
    defaultFiles: {},
    drush: '8.4.8',
    inbox: true,
    php: '7.4',
    services: {appserver: {
      build: [],
      overrides: {volumes: [], environment: {}},
    }},
    proxy: {},
  },
  builder: (parent, config) => class LandoAcquia extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      options.database = 'mysql:5.7';
      // Load .env file.
      options.env_file = ['.env'];
      options.webroot = 'docroot';
      options.xdebug = false;

      // Get and discover our keys
      const keys = utils.sortKeys(options._app.acquiaKeys, options._app.hostKeys);
      // Try to grab other relevant stuff that we might have saved
      const account = _.get(options, '_app.meta.label', null);
      const acliVersion = _.get(options, '_app.config.config.acli_version', 'latest');
      const appUuid = _.get(options, '_app.config.config.ah_application_uuid', null);
      const group = _.get(options, '_app.config.config.ah_site_group', null);
      const key = _.get(options, '_app.meta.key', null);
      const runScripts = _.get(options, '_app.config.config.build.run_scripts', true);
      const secret = _.get(options, '_app.meta.secret', null);

      // Figure out our ACLI situation first
      // Install acli from either 1) latest download, 2) A specific version, or 3) build from a branch
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
          `curl -OL ${acliDownload}`,
          'chmod +x acli.phar',
          'mv acli.phar /usr/local/bin/acli',
        ]);
      } else {
        // Build from source
        const gitHubUrl = 'https://github.com/acquia/cli.git';
        options.services.appserver.build.push(...[
          'rm -rf /usr/local/cli',
          `cd /usr/local/ && git clone ${gitHubUrl} -b "${acliVersion}" && cd cli && composer install`,
          'ln -sf /usr/local/cli/bin/acli /usr/local/bin/acli',
        ]);
      }

      // Symlink the acli config directories
      options.services.appserver.build.push('/helpers/acquia-config-symlink.sh');
      // Run acli build scripts unless purposefully toggled off
      if (runScripts !== false) {
        options.services.appserver.build.push('cd /app && /usr/local/bin/acli pull:run-scripts -n');
      }

      // Run acli login with credentials set in init; if applicable
      if (secret && key) {
        options.services.appserver.build.push(`/usr/local/bin/acli auth:login -k "${key}" -s "${secret}" -n`);
      }

      // Set our appserver env overrides
      options.services.appserver.overrides.environment = {
        AH_SITE_UUID: appUuid,
        AH_SITE_GROUP: group,
        AH_SITE_ENVIRONMENT: 'LANDO',
      };

      // Mount the acquia settings.php file for auto service "discovery"
      const settingsMount = `${options.confDest}/acquia-settings.inc:/var/www/site-php/${group}/${group}-settings.inc`;
      options.services.appserver.overrides.volumes.push(settingsMount);

      // Add in memcache
      if (options.cache) {
        options.services.cache = {type: 'memcached:1', portforward: true, mem: 64};
      }

      // Add in mailhog
      if (options.inbox) {
        options.services.inbox = {type: 'mailhog:v1.0.0', portforward: true, hogfrom: ['appserver']};
        options.proxy.inbox = [`inbox.${options.app}.${options._app._config.domain}`];
      }

      // Add acli and push/pull tooling.
      options.tooling = {
        'acli': {
          service: 'appserver',
          description: 'Run the Acquia acli command',
          cmd: 'acli',
        },
        'pull': getAcquiaPull({key, secret, account, appUuid}, keys),
        'push': getAcquiaPush({key, secret, account, appUuid}, keys),
      };
      super(id, options);
    };
  },
};
