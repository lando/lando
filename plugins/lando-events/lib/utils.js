'use strict';

// Modules
const _ = require('lodash');
const getUser = require('./../../../lib/utils').getUser;

// Helper to find the default service
const getDefaultService = data => {
  if (_.has(data, 'service')) {
    if (_.startsWith(data.service, ':')) {
      const option = _.trimStart(data.service, ':');
      return _.get(data, `options.${option}.default`, 'appserver');
    } else {
      return _.get(data, 'service');
    }
  } else {
    return 'appserver';
  }
};

// Helper to find a command
const getCommand = cmd => typeof cmd === 'object' ? cmd[getFirstKey(cmd)] : cmd;

// Key find helper
const getFirstKey = obj => _.first(_.keys(obj));

// Helper to find a service
const getService = (cmd, data = {}) => {
  return typeof cmd === 'object' ? getFirstKey(cmd) : getDefaultService(data);
};

/*
 * Translate events into run objects
 */
exports.events2Runz = (cmds, app, data = {}) => _.map(cmds, cmd => {
  // Discover the service
  const command = getCommand(cmd);
  const service = getService(cmd, data);
  // Validate the service if we can
  // @NOTE fast engine runs might not have this data yet
  if (app.services && !_.includes(app.services, service)) {
    throw new Error(`This app has no service called ${service}`);
  }
  // Add the build command
  return {
    id: `${app.project}_${service}_1`,
    cmd: ['/bin/sh', '-c', _.isArray(command) ? command.join(' ') : command],
    compose: app.compose,
    project: app.project,
    opts: {
      cstdio: ['inherit', 'pipe', 'pipe'],
      mode: 'attach',
      user: getUser(service, app.info),
      services: [service],
    },
  };
});
