'use strict';

// Modules
const _ = require('lodash');
const utils = require('./../../lib/utils');

// Cmdz
const dlUrl = 'https://github.com/mailhog/mhsendmail/releases/download/v0.2.0/mhsendmail_linux_amd64';
const downloadCmd = `curl -fsSL -o /usr/local/bin/mhsendmail ${dlUrl}`;
const chmodCmd = 'chmod +x /usr/local/bin/mhsendmail';

// Builder
module.exports = {
  name: 'mailhog',
  config: {
    version: 'v1.0.0',
    supported: ['v1.0.0'],
    confSrc: __dirname,
    hogfrom: [],
    port: '1025',
    sources: [],
  },
  parent: '_service',
  builder: (parent, config) => class LandoMailHog extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      // Build the default stuff here
      const hog = {
        image: `mailhog/mailhog:${config.version}`,
        user: 'root',
        environment: {
          TERM: 'xterm',
          MH_HOSTNAME: `${options.name}.mailhog.lando`,
          MH_API_BIND_ADDR: ':80',
          MH_UI_BIND_ADDR: ':80',
        },
        ports: ['80'],
        command: 'MailHog',
        networks: {
          default: {
            aliases: ['sendmailhog'],
          },
        },
      };
      // Add in hogfrom info
      options.info = {hogfrom: options.hogfrom};
      // Mailhog needs to do some crazy shit on other services to work
       _.forEach(options.hogfrom, hog => {
        // Add some build tazk
        utils.addBuildStep([downloadCmd, chmodCmd], options._app, hog, 'build_as_root_internal');
        // Set the hogfrom with some extra things
        options.sources.push({services: _.set({}, hog, {
          environment: {MH_SENDMAIL_SMTP_ADDR: 'sendmailhog:1025'},
          volumes: [`${options.confDest}/mailhog.ini:/usr/local/etc/php/conf.d/zzzz-lando-mailhog.ini`],
        })});
      });

      // Set the mailhpog
      options.sources.push({services: _.set({}, options.name, hog)});
      // Send it downstream
      super(id, options, ..._.flatten(options.sources));
    };
  },
};
