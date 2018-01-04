/**
 * Command to open a lando app by URL
 *
 * @name open
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var openUrl = require('openurl');
  var Promise = lando.Promise;

  // Open the app in a browser
  return {
    command: 'open [appname]',
    describe: 'Open the app in a web browser',
    options: {
      url: {
        describe: 'A specific URL to open',
        alias: ['u']
      }
    },
    run: function(options) {

      // Try to get the app
      return lando.app.get(options.appname)

      // Check for app url and open it
      .then(function(app) {

        if (app) {

          // Set the URL to the option specified one to start
          var url = options.url;

          // Kick off a promise and attempt to get a url if we dont have one
          return Promise.try(function() {
            if (_.isEmpty(url)) {

              // Get information about the app
              return lando.app.info(app)

              // Gather all the URLs
              .then(function(info) {
                return _.flatten(_.map(info, function(item) {
                  return item.urls;
                }));
              })

              // Filter out the null
              .filter(function(url) {
                return !_.isNil(url);
              })

              // Use the top URL
              .then(function(urls) {
                url = urls[0];
              });

            }
          })

          // Actually open up the URL
          .then(function() {
            if (_.isEmpty(url)) {
              lando.log.warn('Could not find a url for your app.');
            }
            else {
              return openUrl.open(url);
            }
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
