'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'nginx',
  config: {
    version: '1.14',
    supported: ['1.14'],
    patchesSupported: true,
    confSrc: __dirname,
    defaultFiles: {
      params: 'fastcgi_params',
      server: 'nginx.conf.tpl',
      vhosts: 'default.conf.tpl',
    },
    remoteFiles: {
      params: '/opt/bitnami/nginx/conf/fastcgi_params',
      server: '/opt/bitnami/extra/nginx/templates/nginx.conf.tpl',
      vhosts: '/opt/bitnami/extra/nginx/templates/default.conf.tpl',
    },
    ssl: false,
    webroot: '.',
  },
  parent: '_webserver',
  builder: (parent, config) => class LandoNginx extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      // Use different default for ssl
      if (options.ssl) options.defaultFiles.vhosts = 'default-ssl.conf.tpl';
      // Build the default stuff here
      const nginx = {
        image: `bitnami/nginx:${options.version}`,
        command: `/launch.sh ${options.remoteFiles.vhosts}`,
        environment: {
          NGINX_HTTP_PORT_NUMBER: '80',
          // @TODO: switching this to non-root seems problematic
          NGINX_DAEMON_USER: 'root',
          NGINX_DAEMON_GROUP: 'root',
        },
        ports: ['80'],
        user: 'root',
        volumes: [
          `${options.confDest}/launch.sh:/launch.sh`,
          `${options.confDest}/${options.defaultFiles.params}:${options.remoteFiles.params}`,
          `${options.confDest}/${options.defaultFiles.server}:${options.remoteFiles.server}:ro`,
          `${options.confDest}/${options.defaultFiles.vhosts}:${options.remoteFiles.vhosts}:ro`,
        ],
      };
      // Send it downstream
      super(id, options, {services: _.set({}, options.name, nginx)});
    };
  },
};
