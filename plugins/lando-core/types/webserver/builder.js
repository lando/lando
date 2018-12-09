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
      sources.push({services: _.set({}, options.name, {environment: {
        LANDO_WEBROOT: `/app/${options.webroot}`,
      }})});
      super(id, options, ...sources);
    };
    info(options, info) {
      info = super.info(options, info);
      info.webroot = options.webroot;
      return info;
    }
  },
};
