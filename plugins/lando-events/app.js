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
        if (!_.isEmpty(eventCommands)) {
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
          app.warnings.push({
            title: `One of your events failed`,
            detail: [
              'This **MAY** prevent your app from working.',
              'Check for errors above, fix them in your Landofile, and run the command again:',
            ],
          });
          lando.log.warn('One of your event commands has failed! This may prevent your app from working correctly');
          lando.log.debug('Event failed with code %s', err);
        });
      });
    });
  }
};
