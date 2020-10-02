'use strict';

// Modules
const _ = require('lodash');
const semver = require('semver');

// Builder
module.exports = {
  name: 'phpmyadmin',
  config: {
    version: '5.0',
    supported: ['5.0', '4.9', '4.8', '4.7', '4.6'],
    legacy: ['4.9', '4.8', '4.7', '4.6'],
    pinPairs: {
      '5.0': 'phpmyadmin/phpmyadmin:5.0.2',
    },
    command: '/docker-entrypoint.sh apache2-foreground',
    confSrc: __dirname,
    hosts: ['database'],
    remoteFiles: {
      config: '/etc/phpmyadmin/config.user.inc.php',
    },
  },
  parent: '_lando',
  builder: (parent, config) => class LandoPma extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      // Arrayify the hosts if needed
      if (!_.isArray(options.hosts)) options.hosts = [options.hosts];
      // Switch to legacy command if needed
      if (semver.lt(`${options.version}.0`, '5.0.0')) options.command = '/run.sh phpmyadmin';
      // Build the default stuff here
      const pma = {
        image: `phpmyadmin/phpmyadmin:${options.version}`,
        environment: {
          MYSQL_ROOT_PASSWORD: '',
          PMA_HOSTS: options.hosts.join(','),
          PMA_PORT: 3306,
          PMA_USER: 'root',
          PMA_PASSWORD: '',
          UPLOAD_LIMIT: 'NOLIMITS!',
        },
        ports: ['80'],
        command: options.command,
      };
      // Add some info
      options.info = {backends: options.hosts};
      // Send it downstream
      super(id, options, {services: _.set({}, options.name, pma)});
    };
  },
};
