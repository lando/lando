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
      options.utility = true;
      options.labels['io.lando.service-container'] = 'TRUE';
      // Add some some globals to all our managed services
      _.forEach(options.manage, service => {
        sources.push({services: _.set({}, service, {environment: options.env, labels: options.labels})});
      });
      // Send downstream
      super(id, options, ...sources);
    };
  },
};
