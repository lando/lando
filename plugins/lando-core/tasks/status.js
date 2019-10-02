'use strict';

const exec = require('child_process').exec;

module.exports = lando => ({
  command: 'status',
  describe: 'Displays the status of your app',
  run: options => {
    // Try to get our app
    const app = lando.getApp(options._app.root);
    // Execute command to display the app status
    if (app) {
      exec('docker ps -a --filter name=^' + app.name + '_',
        function(error, stdout, stderr) {
          console.log(stdout);
          if (stderr) {
            console.log(stderr);
          }
          if (error !== null) {
            console.log('exec error: ' + error);
          }
        }
      );
    } else {
      console.log('No app detected.');
    };
  },
});
