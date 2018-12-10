'use strict';

// Modules
const path = require('path');
const utils = require('./../lib/utils');

// Other things
const bashme = 'if ! type bash > /dev/null; then sh; else bash; fi';
const task = {
  command: 'ssh',
  describe: 'Drops into a shell on a service, runs commands',
  options: {
    service: {
      describe: 'SSH into this service',
      alias: ['s'],
      default: 'appserver',
    },
    command: {
      describe: 'Run a command in the service',
      alias: ['c'],
    },
    user: {
      describe: 'Run as a specific user',
      alias: ['u'],
    },
  },
};

module.exports = lando => {
  task.run = ({appname = undefined, command = bashme, service = 'appserver', user = 'www-data'} = {}) => {
    // Try to get our app
    const app = lando.getApp(path.resolve(process.cwd(), lando.config.landoFile), false);
    // If we have it then init and DOOOO EEEET
    if (app) {
      return app.init().then(() => lando.engine.run({
        id: `${app.project}_${service}_1`,
        compose: app.compose,
        project: app.project,
        cmd: command,
        opts: {
          mode: 'attach',
          pre: ['cd', utils.getContainerPath(app.root)].join(' '),
          user: user,
          services: [service],
        },
      }));
    }
  };
  return task;
};
