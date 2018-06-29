'use strict';

// Modules
const _ = require('lodash');
const utils = require('./lib/utils');

module.exports = lando => {
  // Add tooling module to lando
  lando.events.on('post-bootstrap', 2, lando => {
    lando.log.info('Initializing events');
  });

  // Do all the services magix
  lando.events.on('post-instantiate-app', 1, app => {
    // Check to see if we have any event definitions in our .lando.yml and then
    // queue them up for running
    if (!_.isEmpty(app.config.events)) {
      _.forEach(app.config.events, (cmds, name) => {
        app.events.on(name, 100, data => lando.engine.run(utils.events2Runz(cmds, app, data)).catch(err => {
          lando.log.warn('One of your event commands has failed! This may prevent your app from working correctly');
          lando.log.error('Event failed with code %s and message %s', err.code, err.message);
        }));
      });
    }
  });
};
