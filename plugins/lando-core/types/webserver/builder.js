'use strict';

// Modules
const _ = require('lodash');

/*
 * The lowest level lando service
 */
module.exports = {
  name: '_webserver',
  parent: '_lando',
  builder: parent => class LandoWebServer extends parent {
    constructor(id, options = {}, ...sources) {
      sources.push({services: _.set({}, options.name, {
        environment: {
          LANDO_WEBROOT: `/app/${options.webroot}`,
          LANDO_SERVICE_TYPE: 'webserver',
        },
        working_dir: '/app',
      })});
      // Add in relevant info
      options.info = _.merge({}, options.info, {
        webroot: options.webroot,
      });
      super(id, options, ...sources);
    };
  },
};
