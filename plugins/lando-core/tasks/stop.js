'use strict';

module.exports = lando => {
  // Modules
  const chalk = lando.node.chalk;

  // The task object
  return {
    command: 'stop [appname]',
    describe: 'Stops app in current directory or [appname]',
    run: options => {
      // Try to get the app
      return lando.app.get(options.appname)
      // Restart the app
      .then(app => {
        if (app) {
          return lando.app.stop(app).then(() => {
            console.log(chalk.red('App stopped!'));
          });
        } else {
          lando.log.warn('Could not find app in this dir');
        }
      });
    },
  };
};
