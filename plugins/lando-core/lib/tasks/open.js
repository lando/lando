/**
 * Command to open a lando app by URL
 *
 * @name open
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var openUrl = require('openurl');

  // Open the app in a browser
  return {
    command: 'open [url]',
    describe: 'Open the app in a web browser',
    run: function(options) {
      // Try to get the app
      return lando.app.get(options.url)

      // Check for app url and open it
      .then(function(app) {
        if (app) {
          var url = '';
          if (options.url) {
            url = options.url;
          }
          else {
            var urlInfo = app.config.proxy;
            var proxyName = Object.keys(urlInfo)[0];
            url = 'https://' + app.config.proxy[proxyName][0];
          }

          // Open the url
          if (url !== '') {
            return openUrl.open(url);
          }
          else {
            lando.log.warn('Could not find a url for your app.');
            console.log('You can specify with: --url https://mysite.lndo.site');
          }

        }
        // Warn user we couldn't find an app
        else {
          lando.log.warn('Could not find app in this dir');
        }

      });

    }

  };

};
