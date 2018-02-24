'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var addConfig = lando.utils.services.addConfig;
  var buildVolume = lando.utils.services.buildVolume;

  // "Constants"
  var scd = lando.config.scd;

  /*
   * Supported versions for mailhog
   */
  var versions = [
    'v1.0.0',
    'latest',
    'custom'
  ];

  /*
   * Return the networks needed
   */
  var networks = function() {
    return {};
  };

  /*
   * Build out mailhog
   */
  var services = function(name, config) {

    // Start a services collector
    var services = {};

    // Get the hostname
    var hostname = [name, lando.config.proxyDomain].join('.');

    // Default mailhog service
    var mailhog = {
      image: 'mailhog/mailhog:' + config.version,
      user: 'root',
      environment: {
        TERM: 'xterm',
        MH_API_BIND_ADDR: ':80',
        MH_HOSTNAME: hostname,
        MH_UI_BIND_ADDR: ':80'
      },
      ports: ['80'],
      command: 'MailHog',
      networks: {
        default: {
          aliases: ['sendmailhog']
        }
      }
    };

    // Handle port forwarding
    if (config.portforward) {

      // If true assign a port automatically
      if (config.portforward === true) {
        mailhog.ports.push('1025');
      }

      // Else use the specified port
      else {
        mailhog.ports.push(config.portforward + ':1025');
      }

    }

    // Mailhog is weird and needs to modify other services and right now
    // this seems to be the only way to do this from here
    lando.events.on('post-instantiate-app', function(app) {

      // Stuff we needs
      var smtp = 'sendmailhog:1025';
      var mailHogConf = ['mailhog', 'mailhog.ini'];
      var container = '/usr/local/etc/php/conf.d/lando-mailhog.ini';
      var iniMount = buildVolume(mailHogConf, container, scd);
      var mhsendmail = '/usr/local/bin/mhsendmail';
      var github = 'https://github.com/mailhog/mhsendmail/releases/download/';
      var sendmail = 'v0.2.0/mhsendmail_linux_amd64';
      var smUrl = github + sendmail;
      var downloadCmd = ['curl', '-fsSL', '-o', mhsendmail, smUrl].join(' ');
      var chmodCmd = ['chmod', '+x', mhsendmail].join(' ');

      // Go through each and set up the hogfroms
      _.forEach(_.get(config, 'hogfrom', []), function(hog) {

        // Add in environmental variables
        var env = _.get(app.services[hog], 'environment', {});
        env.MH_SENDMAIL_SMTP_ADDR = smtp;
        _.set(app.services[hog], 'environment', env);

        // Add our default mailhog ini
        var volumes = _.get(app.services[hog], 'volumes', {});
        volumes = addConfig(iniMount, volumes);
        _.set(app.services[hog], 'volumes', volumes);

        // Add in mhsendmail build extra
        var extras = _.get(app.config.services[hog], 'extras', []);
        extras.push(downloadCmd);
        extras.push(chmodCmd);
        _.set(app.config.services[hog], 'extras', extras);

      });

    });

    // Put it all together
    services[name] = mailhog;

    // Return our service
    return services;

  };

  /*
   * Return the volumes needed
   */
  var volumes = function() {
    return {data: {}};
  };

  /*
   * Metadata about our service
   */
  var info = function(name, config) {

    // Add in generic info
    var info = {
      'internal_connection': {
        host: name,
        port: config.port || 1025
      },
      'external_connection': {
        host: 'localhost',
        port: config.portforward || 'not forwarded'
      }
    };

    // Show the config files being used if they are custom
    if (!_.isEmpty(config.config)) {
      info.config  = config.config;
    }

    // Return the collected info
    return info;

  };

  return {
    info: info,
    networks: networks,
    services: services,
    versions: versions,
    volumes: volumes,
    configDir: __dirname
  };

};
