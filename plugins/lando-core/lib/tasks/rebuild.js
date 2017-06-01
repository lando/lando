/**
 * Command to restop a lando app
 *
 * @name restop
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var chalk = lando.node.chalk;

  // The task object
  return {
    command: 'rebuild [appname]',
    describe: 'Rebuilds app in current directory or [appname]',
    options: {
      yes: {
        describe: 'Auto answer yes to prompts',
        alias: ['y'],
        default: false,
        boolean: true,
        interactive: {
          type: 'confirm',
          message: 'Are you sure you want to rebuild?'
        }
      }
    },
    run: function(options) {

      // Stop rebuild if user decides its a nogo
      if (!options.yes) {
        console.log(chalk.yellow('Rebuild aborted'));
        return;
      }

      // Attempt to grab the app if we can
      return lando.app.get(options.appname)

      // Rebuild the app
      .then(function(app) {
        if (app) {
          return lando.app.rebuild(app)
          .then(function() {
            console.log(chalk.green('App rebuilt!'));
          });
        }
        // Warn user we couldn't find an app
        else {
          lando.log.warn('Could not find app in this dir');
        }
      });

    }
  };

};
