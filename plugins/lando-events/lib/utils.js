'use strict';

// Modules
const _ = require('lodash');

// Key find helper
const getFirstKey = obj => _.first(_.keys(obj));

// Helper to find a service
const getService = (cmd, data = {}) => {
  return typeof cmd === 'object' ? getFirstKey(cmd) : _.get(data, 'service', 'appserver');
};

// Helper to find a command
const getCommand = cmd => typeof cmd === 'object' ? cmd[getFirstKey(cmd)] : cmd;

/*
 * Translate events into run objects
 */
exports.events2Runz = (cmds, app, data = {}) => _.map(cmds, cmd => {
  // Discover the service
  const service = getService(cmd, data);
  // Validate the service if we can
  // @NOTE fast engine runs might not have this data yet
  if (app.services && !_.includes(app.services, service)) {
    throw new Error(`This app has no service called ${service}`);
  }
  // Add the build command
  return {
    id: `${app.project}_${service}_1`,
    cmd: getCommand(cmd),
    compose: app.compose,
    project: app.project,
    opts: {
      app: app,
      mode: 'attach',
      user: 'www-data',
      services: [service],
    },
  };
});
