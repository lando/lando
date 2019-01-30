'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'tomcat',
  config: {
    version: '8',
    supported: ['9', '9.0', '8', '8.5', '8.0', '7', '7.0'],
    legacy: ['7', '7.0'],
    patchesSupported: true,
    confSrc: __dirname,
    defaultFiles: {
      server: 'server.xml',
    },
    remoteFiles: {
      server: '/usr/local/tomcat/conf/server.xml',
      web: '/usr/local/tomcat/conf/web.xml',
      context: '/usr/local/tomcat/conf/context.xml',
      user: '/usr/local/tomcat/conf/tomcat-users.xml',
    },
    ssl: false,
    webroot: '.',
  },
  parent: '_webserver',
  builder: (parent, config) => class LandoTomcat extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      // Use different default for ssl
      if (options.ssl) options.defaultFiles.server = 'server-ssl.xml';
      // Build the default stuff here
      const tomcat = {
        image: `tomcat:${options.version}-slim`,
        command: 'catalina.sh run',
        environment: {
          CATALINA_OPTS: `-Dlando.http=80 -Dlando.https=443 -Dlando.webroot=/app/${options.webroot}`,
        },
        ports: ['80'],
        volumes: [
          `${options.confDest}/${options.defaultFiles.server}:${options.remoteFiles.server}`,
        ],
      };
      // Send it downstream
      super(id, options, {services: _.set({}, options.name, tomcat)});
    };
  },
};
