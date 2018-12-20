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
      super(id, options, ...sources);
    };
  },
};
