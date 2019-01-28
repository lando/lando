'use strict';

// Modules
const _ = require('lodash');

/*
 * The lowest level lando service
 */
module.exports = {
  name: '_appserver',
  parent: '_lando',
  builder: parent => class LandoAppserver extends parent {
    constructor(id, options = {}, ...sources) {
      // Add in webroot if we have one
      if (_.has(options, 'webroot')) {
        options.info = _.merge({}, options.info, {
          webroot: options.webroot,
        });
      }
      // And set the working dir
      sources.push({services: _.set({}, options.name, {
        working_dir: '/app',
        environment: {
          LANDO_SERVICE_TYPE: 'webserver',
        },
      })});
      super(id, options, ...sources);
    };
  },
};
