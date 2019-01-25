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
      app.events.on(name, 9999, data => {
        const eventCommands = utils.events2Runz(cmds, app, data);
        if (!_.isEmpty(eventCommands) && process.platform === 'linux') {
          _.forEach(_.uniq(_.map(eventCommands, 'id')), container => {
            eventCommands.unshift({
              id: container,
              cmd: '/helpers/user-perms.sh --silent',
              compose: app.compose,
              project: app.project,
              opts: {
                mode: 'attach',
                user: 'root',
                services: [container.split('_')[1]],
              },
            });
          });
        }
        return lando.engine.run(eventCommands).catch(err => {
          lando.log.warn('One of your event commands has failed! This may prevent your app from working correctly');
          lando.log.error('Event failed with code %s and message %s', err.code, err.message);
        });
      });
    });
  }
};
