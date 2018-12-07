'use strict';

// Modules
const _ = require('lodash');
const path = require('path');

/*
    FROM NETWORKINGZ, maybe this goes in core?
    /*
      // Helper to root run commands
      const runRoot = (services, cmd, app) => lando.engine.run(_.map(services, (service, name) => ({
        id: [service._app, name, '1'].join('_'),
        cmd: cmd,
        compose: app.compose,
        project: app.name,
        opts: {
          app: app,
          detach: true,
          mode: 'attach',
          user: 'root',
          services: [name],
        },
      })));

      // Define some things

    // Start up a build collector and set target build services
    let buildServices = app.config.services;
    // Check to see if we have to filter out build services
    // Currently this only exists so we can ensure lando rebuild's -s option
    // is respected re: build steps
    if (!_.isEmpty(_.get(app, 'config._rebuildOnly', []))) {
      const picker = _.get(app, 'config._rebuildOnly');
      buildServices = _.pick(buildServices, picker);
    }

    app.events.on('app-ready', 9, () => {
      app.events.on('post-start', 9999, () => runRoot(buildServices, '/helpers/refresh-certs.sh > /cert-log.txt', app));
    });
*/

/*
 * The lowest level lando service, this is where a lot of the deep magic lives
 */
module.exports = {
  name: '_lando',
  parent: '_compose',
  builder: parent => class LandoService extends parent {
    constructor(
      id,
      {
        name,
        type,
        userConfRoot,
        manage = [],
        ssl = false,
        refreshCerts = false,
      } = {},
      ...sources
    ) {
      // Get some basic locations
      const scriptsDir = path.join(userConfRoot, 'scripts');
      const entrypoint = path.join(scriptsDir, 'lando-entrypoint.sh');
      const addCertsScript = path.join(scriptsDir, 'add-cert.sh');
      const refreshCertsScript = path.join(scriptsDir, 'refresh-certs.sh');

      // Handle Volumes
      const volumes = [
        `${userConfRoot}:/lando:delegated`,
        `${scriptsDir}:/helpers`,
        `${entrypoint}:/lando-entrypoint.sh`,
      ];

      // Handle Scripts
      // Generate certs if ssl is turned on
      if (ssl) volumes.push(`${addCertsScript}:/scripts/add-cert.sh`);
      // Refresh certs is indicated
      // @TODO: this might only be relevant to the proxy
      if (refreshCerts) volumes.push(`${refreshCertsScript}:/scripts/refresh-certs.sh`);

      // Handle Environment
      const environment = {
        LANDO_SERVICE_NAME: name,
        LANDO_SERVICE_TYPE: type,
      };

      // Loop through our managed services and add in the above
      _.forEach(manage, service => {
        sources.push({services: _.set({}, service, {
          entrypoint: '/lando-entrypoint.sh',
          environment,
          volumes,
        })});
      });

      // Handle overrides
      // THESE MUST COME LAST
      super(id, ...sources);
    };
  },
};
