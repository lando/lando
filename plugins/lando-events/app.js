'use strict';

// Modules
const _ = require('lodash');
const utils = require('./lib/utils');

/*
 * @TODO
 */
module.exports = (app, lando) => {
  if (!_.isEmpty(_.get(app, 'config.events', []))) {
    _.forEach(app.config.events, (cmds, name) => {
      app.events.on(name, 100, data => lando.engine.run(utils.events2Runz(cmds, app, data)).catch(err => {
        lando.log.warn('One of your event commands has failed! This may prevent your app from working correctly');
        lando.log.error('Event failed with code %s and message %s', err.code, err.message);
      }));
    });
  }
};
