'use strict';

module.exports = function(lando) {

  // Modules
  var chalk = lando.node.chalk;

  // The task object
  return {
    command: 'destroy [appname]',
    describe: 'Destroy app in current directory or [appname]',
    options: {
      yes: {
        describe: 'Auto answer yes to prompts',
        alias: ['y'],
        default: false,
        boolean: true,
        interactive: {
          type: 'confirm',
          default: false,
          message: 'Are you sure you want to DESTROY?'
        }
      }
    },
    run: function(options) {

      // Stop rebuild if user decides its a nogo
      if (!options.yes) {
        console.log(chalk.yellow('DESTRUCTION AVERTED!'));
        return;
      }

      // Try to get the app if we can
      return lando.app.get(options.appname)

      // Destroy the app
      .then(function(app) {
        if (app) {
          return lando.app.destroy(app)
          .then(function() {
            console.log(chalk.red('App destroyed!'));
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
