'use strict';

// Modules
const _ = require('lodash');
const path = require('path');
const utils = require('./../../lib/utils');

/*
 * Build Drupal 7
 */
module.exports = {
  name: 'pantheon',
  parent: '_lamp',
  config: {
    confSrc: __dirname,
    defaultFiles: {
      php: 'php.ini',
      database: 'mysql.cnf',
      server: 'nginx.conf.tpl',
    },
    framework: 'drupal',
    services: {appserver: {overrides: {
      volumes: [
        '/var/www/.drupal',
        '/var/www/.drush',
        '/var/www/.terminus',
        '/var/www/.wp-cli',
      ],
    }}},
    xdebug: false,
    webroot: '.',
  },
  builder: (parent, config) => class LandoPantheon extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options, utils.getPantheonConfig([
        path.join(options.root, 'pantheon.upstream.yml'),
        path.join(options.root, 'pantheon.yml'),
      ]));

      // Normalize because 7.0 gets handled strangely by js-yaml
      if (options.php === 7) options.php = '7.0';

      // Enforce certain options for pantheon parity
      options.via = 'nginx:1.14';
      options.database = 'mariadb:10.1';

      // Set correct things based on framework
      options.defaultFiles.vhosts = `${options.framework}.conf.tpl`;

      // Use our custom pantheon images
      options.services.appserver.overrides.image = `devwithlando/pantheon-appserver:${options.php}-2`;
      // Add in the prepend.ini
      // @TODO: this throws a weird DeprecationWarning: 'root' is deprecated, use 'global' for reasons not immediately clear
      options.services.appserver.overrides.volumes.push(`${options.confDest}/prepend.php:/srv/includes/prepend.php`);
      // Add in our environment
      options.services.appserver.overrides.environment = utils.getPantheonEnvironment(options);

      // Send downstream
      super(id, options);
    };
  },
};
