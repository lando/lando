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
   * Share defaults
   */
  var shareDefaults = function() {
    return {
      uid: 33,
      user: 'www-data',
      gid: 33,
      group: 'www-data'
    };
  };

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
      var opts = [
        '-repeat',
        'watch',
        '-retry',
        '5',
        '-prefer',
        '/kalashare'
      ];

      // Return our list
      return opts.join(' ');

    };

    /*
     * Return a unison contaniner with our sharing opts
     */
    var getUnison = function(share, service) {
      return {
        image: 'kalabox/sync:2.49',
        restart: 'on-failure',
        environment: {
          'UNISON_WEBROOT': share.remote,
          'UNISON_CODEROOT': '/kalashare',
          'UNISON_OPTIONS': getUnisonOptions(),
          'UNISON_UID': share.uid,
          'UNISON_USER': share.user,
          'UNISON_GID': share.gid,
          'UNISON_GROUP': share.group
        },
        volumes: [
          '$LANDO_APP_ROOT_BIND:/kalashare',
          [service, share.remote].join(':')
        ]
      };
    };

    // Start the services collector
    var services = {};

    // Go through our conf and add the services
    _.forEach(shares, function(share, service) {

      // Give this a contianer name
      var name = 'unison' + service;

      // Merge in our defaults
      share = _.merge(shareDefaults(), share);

      // Get the unison piece
      services[name] = getUnison(share, service);

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

    // Move our scripts over
    var scriptsDir = path.join(__dirname, '..', 'scripts');
    scriptsDir = lando.services.moveConfig('scripts', scriptsDir);

    // Start the services collector
    var services = {};

    // Go through our conf and add the services
    _.forEach(shares, function(share, service) {

      // Add the volume directly
      services[service] = {
        volumes: [
          '$LANDO_APP_ROOT_BIND:' + share.remote
        ]
      };

      // Merge in our defaults
      share = _.merge(shareDefaults(), share);

      // Add envars to help with usermapping
      services[service].environment = {
        'SHARING_UID': share.uid,
        'SHARING_USER': share.user,
        'SHARING_GID': share.gid,
        'SHARING_GROUP': share.group
      };

      // Add the usermap script
      var volumes = services[service].volumes;
      var addScript = lando.services.addScript;
      services[service].volumes = addScript('sharing-usermap.sh', volumes);

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
          fs.mkdirpSync(path.join(app.root, '.'));
          app.volumes[name] = {};
        });

        // Take some care to merge in our shares
        _.forEach(shareCompose, function(share, name) {

          // Add new containers
          if (_.isEmpty(app.services[name])) {
            app.services[name] = share;
          }

          // Merge in things
          var merger = lando.services.mergeOver;
          app.services[name] = merger(app.services[name], shareCompose[name]);

          // Log
          lando.log.verbose(
            'Sharing from %s to %s on %s for %s',
            app.root, share.remote, name, app.name
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
