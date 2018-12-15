'use strict';

// Modules
const _ = require('lodash');
const utils = require('./lib/utils');

module.exports = (app, lando) => {
  // Tooling cache key
  const toolingCache = `${app.name}.tooling.cache`;

  // If we have an app with a tooling section let's do this
  if (!_.isEmpty(_.get(app, 'config.tooling', {}))) {
    lando.log.verbose('Additional tooling detected for app %s', app.name);
    // Add the tasks after we init the app
    _.forEach(utils.getToolingTasks(app.config.tooling, app), task => {
      lando.log.verbose('Adding app cli task %s', task.name);
      app.tasks.push(utils.buildTask(task, lando));
    });
  }

  // Save a tooling cache every time the app is ready, this allows us to
  // run faster tooling commands
  app.events.on('ready', () => {
    lando.cache.set(toolingCache, {
      name: app.name,
      project: app.project,
      compose: app.compose,
      root: app.root,
    }, {persist: true});
  });

  // Remove tooling cache on uninstall
  app.events.on('post-uninstall', () => {
    lando.cache.remove(toolingCache);
  });
};
