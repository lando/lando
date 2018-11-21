'use strict';

const bashme = 'if ! type bash > /dev/null; then sh; else bash; fi';
const utils = require('./../lib/utils');
const task = {
  command: 'ssh [service] [appname]',
  describe: 'SSH into [service] in current app directory or [appname]',
  options: {
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
    // Try to get the app if we can
    return lando.app.get(appname)
    // Run it
    .then(app => {
      if (app) {
        return lando.engine.run({
          id: [app.name, service, '1'].join('_'),
          compose: app.compose,
          project: app.name,
          cmd: command,
          opts: {
            app: app,
            mode: 'attach',
            pre: ['cd', utils.getContainerPath(app.root)].join(' '),
            user: user,
            services: [service],
          },
        });
      } else {
        lando.log.warn('Could not find app in this dir');
      }
    });
  };
  return task;
};
