'use strict';

// Modules
const _ = require('lodash');
const buildTask = require('./lib/build');
const utils = require('./lib/utils');

module.exports = (app, lando) => {
  // Compose cache key
  const composeCache = `${app.name}.compose.cache`;

  // If we have an app with a tooling section let's do this
  app.events.on('post-init', () => {
    if (!_.isEmpty(_.get(app, 'config.tooling', {}))) {
      lando.log.verbose('Additional tooling detected for app %s', app.name);
      // Add the tasks after we init the app
      _.forEach(utils.getToolingTasks(app.config.tooling, app), task => {
        lando.log.verbose('Adding app cli task %s', task.name);
        app.tasks.push(buildTask(task, lando));
      });
    }
  });

  // Save a compose cache every time the app is ready, this allows us to
  // run faster tooling commands
  app.events.on('ready', () => {
    lando.cache.set(composeCache, {
      name: app.name,
      project: app.project,
      compose: app.compose,
      root: app.root,
      info: app.info,
    }, {persist: true});
  });

  // Remove compose cache on uninstall
  app.events.on('post-uninstall', () => {
    lando.cache.remove(composeCache);
  });
};
