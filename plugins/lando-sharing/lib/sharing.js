/**
 * This does the shraing
 *
 * @name sharing
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var fs = lando.node.fs;
  var path = require('path');

  /*
   * Helper function to generate the appropriate sharing compose file on
   * macOS
   */
  var getSharingComposeDarwin = function(shares) {

    /*
     * Get a list of unison options based on the platform
     */
    var getUnisonOptions = function() {
      // Start with our basic options
      var opts = ['-repeat', 'watch', '-retry', '5'];
      // Return our list
      return opts.join(' ');
    };

    /*
     * Return a unison contaniner with our sharing opts
     */
    var getUnison = function(local, remote, service) {
      return {
        image: 'kalabox/unison:2.49',
        restart: 'on-failure',
        environment: {
          'UNISON_WEBROOT': remote,
          'UNISON_CODEROOT': '/kalashare/' + local,
          'UNISON_OPTIONS': getUnisonOptions()
        },
        volumes: [
          '$LANDO_APP_ROOT_BIND:/kalashare',
          [service, remote].join(':')
        ]
      };
    };

    // Start the services collector
    var services = {};

    // Go through our conf and add the services
    _.forEach(shares, function(share, service) {

      // Give this a contianer name
      var name = 'unison' + service;

      // Get the unison piece
      services[name] = getUnison(share.local, share.remote, service);

      // Add the volume to the service
      services[service] = {volumes: [[service, share.remote].join(':')]};

    });

    // Return services
    return services;

  };

  /*
   * Helper function to generate the appropriate sharing compose file on
   * Linux/Windows
   */
  var getSharingComposeGeneric = function(shares) {

    // Start the services collector
    var services = {};

    // Go through our conf and add the services
    _.forEach(shares, function(share, service) {
      services[service] = {
        volumes: [
          '$LANDO_APP_ROOT_BIND/' + share.local + ':' + share.remote
        ]
      };
    });

    // Return our services
    return services;

  };

  /*
   * Helper function to generate the appropriate sharing compose file
   */
  var getSharingCompose = function(shares) {
    switch (lando.config.os.platform) {
      case 'win32': return getSharingComposeGeneric(shares);
      case 'darwin': return getSharingComposeDarwin(shares);
      case 'linux': return getSharingComposeGeneric(shares);
    }
  };

  // Grab our sharing config
  lando.events.on('post-instantiate-app', function(app) {

    // If the sharing is on and our app has config
    if (lando.config.sharing === 'ON' && !_.isEmpty(app.config.sharing)) {

      // Get our sharing config
      var shares = app.config.sharing || {};

      // Add sharing to our app
      app.events.on('app-ready', function() {

        // Get the compose files we need to merge
        var shareCompose = getSharingCompose(shares);

        // Make sure local webroots exist and our volumes TL is set
        _.forEach(shares, function(share, name) {
          fs.mkdirpSync(path.join(app.root, share.local));
          app.volumes[name] = {};
        });

        // Take some care to merge in our shares
        _.forEach(shareCompose, function(share, name) {

          // Add new containers
          if (_.isEmpty(app.services[name])) {
            app.services[name] = share;
          }

          // Get old volumes if they exist and add them to the new
          var oldVols = app.services[name].volumes || [];
          var newVols = _.flatten([oldVols, shareCompose[name].volumes]);

          // Reset shareCompsoe volumes
          app.services[name].volumes = _.uniq(newVols);

          // Log
          lando.log.verbose(
            'Sharing from %s to %s on %s for %s',
            share.local, share.remote, name, app.name
          );

        });

        // Log
        lando.log.info('Sharing folders');

      });

      // Add sharing to our app info
      app.events.on('pre-info', function() {
        _.forEach(shares, function(share, service) {
          if (app.info[service]) {
            app.info[service].share = share;
          }
        });
      });

    }

  });

};
