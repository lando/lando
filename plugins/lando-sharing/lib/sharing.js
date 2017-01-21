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
        restart: 'always',
        environment: {
          'UNISON_WEBROOT': remote,
          'UNISON_CODEROOT': '/kalashare/' + local,
          'UNISON_OPTIONS': getUnisonOptions()
        },
        volumes: [
          '$LANDO_APP_ROOT_BIND:/kalashare'
        ],
        'volumes_from': [service]
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
      services[service] = {volumes: [share.remote]};

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
      app.events.on('app-info', function() {

        // Add the shares directly to the app info and make sure
        // local webroot exists
        _.forEach(shares, function(share, service) {

          // Add the app object
          app.info[service].share = share;

          // Log
          lando.log.verbose(
            'Sharing from %s to %s on %s for %s',
            share.local, share.remote, service, app.name
          );

          // Ensure the local webroot exists
          fs.mkdirpSync(app.info[service].share.local);

        });

        // Get the compose files we need to merge
        var shareCompose = getSharingCompose(shares);

        // Take some care to merge in our shares
        _.forEach(shareCompose, function(share, service) {

          // Add new containers
          if (_.isEmpty(app.containers[service])) {
            app.containers[service] = share;
          }

          // Get old volumes if they exist and add them to the new
          var oldVols = app.containers[service].volumes || [];
          var newVols = _.flatten([oldVols, shareCompose[service].volumes]);

          // Reset shareCompsoe volumes
          app.containers[service].volumes = _.uniq(newVols);

        });

        // Log
        lando.log.info('Sharing folders');

      });

    }

  });

};
