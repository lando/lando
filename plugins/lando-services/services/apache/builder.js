'use strict';

// Modules
const _ = require('lodash');
const path = require('path');

// Builder
module.exports = {
  name: 'apache',
  config: {
    // Versions
    version: '2.4',
    supported: ['2.4'],
    patchesSupported: true,
    legacy: [],
    // Config
    confSrc: __dirname,
    defaultFiles: {
      server: path.join(__dirname, 'httpd.conf'),
      vhosts: path.join(__dirname, 'default.conf'),
    },
    remoteFiles: {
      server: '/bitnami/apache/conf/httpd.conf',
      vhosts: '/bitnami/apache/conf/bitnami/bitnami.conf',
    },
    webroot: '.',
  },
  parent: '_webserver',
  builder: (parent, config) => class LandoApache extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      // Build the default stuff here
      const apache = {
        image: `bitnami/apache:${options.version}`,
        command: '/app-entrypoint.sh /run.sh',
        environment: {
          APACHE_HTTP_PORT_NUMBER: '80',
          APACHE_HTTPS_PORT_NUMBER: '443',
          APACHE_USER: 'www-data',
          APACHE_GROUP: 'www-data',
        },
        ports: ['80'],
        user: 'root',
        volumes: [
          `${options.defaultFiles.server}:${options.remoteFiles.server}`,
          `${options.defaultFiles.vhosts}:${options.remoteFiles.vhosts}`,
        ],
      };
      // Enforce ssl
      // TODO? im not sure why we wouldnt want to at this point?
      options.ssl = true;
      // Send it downstream
      super(id, options, {services: _.set({}, options.name, apache)});
    };
  },
};
