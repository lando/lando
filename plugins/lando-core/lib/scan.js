/**
 * This adds a function so apps scan their URLS when they start up
 *
 * Specifically, this will try to determine which URLS are reachable.
 *
 * @name scan
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var Promise = lando.Promise;
  var rest = lando.node.rest;

  // Add in some high level config so our app can handle
  lando.events.on('post-instantiate-app', 1, function(app) {

    // Scan our URLs and add a list of them and their status to the app
    app.events.on('post-start', 9, function() {

      // Get app URLs
      var urls = _.flatMap(app.info, 'urls');

      // Ping the sites for awhile to determine if they are g2g
      return Promise.map(urls, function(url) {

        // Do a reasonable amount of retries
        return Promise.retry(function() {

          // Log the attempt
          lando.log.verbose('Checking to see if %s is ready.', url);

          // Send REST request.
          return new Promise(function(fulfill, reject) {

            // Make the actual request, lets make sure self-signed certs are OK
            rest.get(url, {rejectUnauthorized: false})

            // The URL is accesible
            .on('success', function() {
              lando.log.verbose('%s is now ready.', url);
              fulfill({url: url, status: true});
            })

            // Throw an error on fail/error
            .on('fail', function(data, response) {

              // Get the codes and define codes that should indicate the site is not ready yet
              var code = response.statusCode;
              var waitCodes = [400, 502];

              // If we have a wait code try again
              if (_.includes(waitCodes, code)) {
                lando.log.debug('%s not yet ready with code %s.', url, code);
                reject({url: url, status: false});
              }

              // If we have another code then we assume thing are ok
              else {
                lando.log.debug('%s is now ready.', url);
                fulfill({url: url, status: true});
              }

            })

            // Something else bad happened
            .on('error', reject);

          });

        }, {max: 3})

        // Catch any error and return an inaccesible url
        .catch(function(err) {
          lando.log.warn('%s is not accessible', url);
          lando.log.debug('%s not accessible with error', url, err.message);
          return {url: url, status: false};
        });

      })

      // Add our URLS to the app
      .then(function(urls) {
        app.urls = urls;
      });

    });

  });

};
