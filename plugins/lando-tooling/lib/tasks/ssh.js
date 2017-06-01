/**
 * Command to destroy a lando app
 *
 * @name destroy
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;

  // The task object
  return {
    command: 'ssh [appname] [service]',
    describe: 'SSH into [service] in current app directory or [appname]',
    options: {
      command: {
        describe: 'Run a command in the service',
        alias: ['c']
      }
    },
    run: function(options) {

      // Handle our options
      if (!_.has(options, 'service') && _.has(options, 'appname')) {
        options.service = options.appname;
        options.appname = undefined;
      }

      // Try to get the app if we can
      return lando.app.get(options.appname)

      // Handle app or no app
      .then(function(app) {

        // We have an app so lets try to build a ssh exec
        if (app) {

          // Build out our run
          var run = {
            id: [app.dockerName, options.service, '1'].join('_'),
            cmd: options.command || 'bash',
            opts: {
              mode: 'attach'
            }
          };

          // Exec
          return lando.engine.run(run);

        }

        // Warn user we couldn't find an app
        else {
          lando.log.warn('Could not find app in this dir');
        }

      });

    }
  };

};
