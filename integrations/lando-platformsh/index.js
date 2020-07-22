'use strict';

// Modules
const _ = require('lodash');
const utils = require('./lib/utils');

/*
 * Stuff
 */
module.exports = lando => {
  // Sanitize any platformsh auth
  lando.log.alsoSanitize('platformsh-auth');

  /*
   * This event makes sure that tooling commands that are run against an app container
   * are run through /helpers/psh-exec.sh first so they get the needed envvars eg HOME, USER, and PLATFORM_* set
   */
  lando.events.on('pre-engine-runner', app => {
    if (_.get(app, 'config.recipe') === 'platformsh') {
      // This is a cheap way to get the list of platform appservers
      // @TODO: will node, python, etc appserver still use `web`?
      const appservers = _(app.info).filter(info => info.meUser === 'web').map('service').value();

      // Loop through the tooling
      _.forEach(app.config.tooling, (tooling, name) => {
        // Standardize and arrayify tooling
        const cmd = tooling.cmd ? tooling.cmd : tooling.name;
        const cmds = (!_.isArray(cmd)) ? [cmd] : cmd;
        // Reset tooling
        tooling.cmd = utils.setPshExec(cmds, tooling.service, appservers);
      });
    }
  });

  /*
   * Same as above but we do something special for SSH
   */
  lando.events.on('cli-ssh-run', data => {
    if (_.get(data, 'options._app.recipe') === 'platformsh') {
      // Reset the default from appserver to the closest app
      if (data.options.service === 'appserver') {
        // Reset the default service from appserver to whatever the closest application service is
        const app = _.get(data, 'options._app', {});
        const defaultSshService = _.get(app, 'tooling.platform.service', 'app');
        data.options.service = defaultSshService;
        data.options.s = defaultSshService;
      }

      // Reset the default command if needed
      if (!_.has(data, 'options.command')) {
        data.options.command = 'if ! type bash > /dev/null; then sh; else bash; fi';
      }

      // Wrap commands in /helpers/psh-exec.sh
      data.options.command = ['/helpers/psh-exec.sh', '/bin/sh', '-c', data.options.command];
    }
  });
};
