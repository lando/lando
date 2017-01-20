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

  // Add in some high level config so our app can handle
  lando.events.on('post-instantiate-app', 1, function(app) {

    // Scan our URLs and add a list of them and their status to the app
    app.events.on('post-start', 9, function() {

      // Get app URLs
      var urls = _.flatMap(app.info, 'urls');

      // Scan the urls
      return lando.utils.scanUrls(urls, {max: 3})

      // Add our URLS to the app
      .then(function(urls) {
        app.urls = urls;
      });

    });

  });

};
