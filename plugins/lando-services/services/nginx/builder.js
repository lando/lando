'use strict';

// Modules
const _ = require('lodash');
const path = require('path');

/*
 * nginx for all
 */
module.exports = {
  name: 'nginx',
  config: {
    // Versions
    version: '1.14',
    supported: ['1.14'],
    legacy: [],
    // Config
    confSrc: __dirname,
    defaultFiles: {
      params: path.join(__dirname, 'fastcgi_params'),
      server: path.join(__dirname, 'nginx.conf.tpl'),
      vhosts: path.join(__dirname, 'default.conf.tpl'),
    },
    remoteFiles: {
      params: '/opt/bitnami/nginx/conf/fastcgi_params',
      server: '/opt/bitnami/extra/nginx/templates/nginx.conf.tpl',
      vhosts: '/opt/bitnami/extra/nginx/templates/default.conf.tpl',
    },
    webroot: '.',
  },
  parent: '_webserver',
  builder: (parent, config) => class LandoNginx extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      // Build the default stuff here
      const nginx = {
        image: `bitnami/nginx:${options.version}`,
        command: [
          '/bin/bash -c',
          '"mkdir -p /opt/bitnami/nginx/conf/vhosts',
          '&&',
          'render-template',
          `\"${options.remoteFiles.vhosts}\" > \"/opt/bitnami/nginx/conf/vhosts/lando.conf\"`,
          '&&',
          '/entrypoint.sh /run.sh"',
        ].join(' '),
        environment: {
          NGINX_HTTP_PORT_NUMBER: '80',
          // @TODO: switching this to non-root seems problematic
          NGINX_DAEMON_USER: 'root',
          NGINX_DAEMON_GROUP: 'root',
        },
        ports: ['80'],
        user: 'root',
        volumes: [
          `${options.defaultFiles.params}:${options.remoteFiles.params}`,
          `${options.defaultFiles.server}:${options.remoteFiles.server}`,
          `${options.defaultFiles.vhosts}:${options.remoteFiles.vhosts}`,
        ],
      };
      // Enforce ssl
      // TODO? im not sure why we wouldnt want to at this point?
      options.ssl = true;
      // Send it downstream
      super(id, options, {services: _.set({}, options.name, nginx)});
    };
  },
};
