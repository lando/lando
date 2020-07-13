'use strict';

// Modules
const _ = require('lodash');

/*
 * The lowest level lando service
 */
module.exports = {
  name: '_landoutil',
  parent: '_lando',
  builder: parent => class LandoUtility extends parent {
    constructor(id, options = {}, ...sources) {
      // Set some other options and mixin stuffs
      options.labels['io.lando.service-container'] = 'TRUE';
      options.env.LANDO_NO_USER_PERMS = 'NOTGONNADOIT';
      // Add some some globals to the service
      sources.push({services: _.set({}, options.name, {environment: options.env, labels: options.labels})});
      // Send downstream
      super(id, options, ...sources);
    };
  },
};
