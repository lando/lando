'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'apache',
  config: {
    version: '2.4',
    supported: ['2.4'],
    pinPairs: {
      '2.4': 'bitnami/apache:2.4.41-debian-10-r52',
    },
    patchesSupported: true,
    confSrc: __dirname,
    defaultFiles: {
      server: 'httpd.conf',
      vhosts: 'default.conf',
    },
    remoteFiles: {
      server: '/opt/bitnami/apache/conf/httpd.conf',
      vhosts: '/opt/bitnami/apache/conf/vhosts/lando.conf',
    },
    ssl: false,
    webroot: '.',
  },
  parent: '_webserver',
  builder: (parent, config) => class LandoApache extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      // Use different default for ssl
      if (options.ssl) options.defaultFiles.vhosts = 'default-ssl.conf';
      // Build the default stuff here
      const apache = {
        image: `bitnami/apache:${options.version}`,
        command: '/launch.sh',
        environment: {
          APACHE_HTTP_PORT_NUMBER: '80',
          APACHE_HTTPS_PORT_NUMBER: '443',
          APACHE_USER: 'www-data',
          APACHE_GROUP: 'www-data',
          LANDO_NEEDS_EXEC: 'DOEEET',
        },
        ports: ['80'],
        user: 'root',
        volumes: [
          `${options.confDest}/launch.sh:/launch.sh`,
          `${options.confDest}/${options.defaultFiles.server}:${options.remoteFiles.server}`,
          `${options.confDest}/${options.defaultFiles.vhosts}:${options.remoteFiles.vhosts}:ro`,
        ],
      };
      // Send it downstream
      super(id, options, {services: _.set({}, options.name, apache)});
    };
  },
};
