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

  // Get the app object so we can do app things
  lando.events.on('post-instantiate-app', function(app) {

    // Scan our URLs and add a list of them and their status to the app
    app.events.on('post-start', 9, function() {

      // Get app URLs
      var urls = _.filter(_.flatMap(app.info, 'urls'), _.identity);

      // Scan the urls
      return lando.utils.scanUrls(urls, {max: 17})

      // Add our URLS to the app
      .then(function(urls) {
        app.urls = urls;
      });

    });

  });

};
