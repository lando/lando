'use strict';

// Modules
const _ = require('lodash');
const os = require('os');
const path = require('path');
const {getKeys, parseKey} = require('../../lib/keys');
const {getPull} = require('../../lib/pull');
const {getPush} = require('../../lib/push');
const {getLandoAuxServices, getLandoServices, getSQLServices} = require('./../../lib/services');
const {getLandoTooling, getDBUtils} = require('./../../lib/tooling');
const {getLandoProxyRoutes} = require('./../../lib/proxy');

/*
 * Build Lagoon and stuff
 */
module.exports = {
  name: 'lagoon',
  parent: '_recipe',
  config: {
    confSrc: __dirname,
    build: [],
    proxy: {},
    services: {},
    tooling: {},
  },
  builder: (parent, config) => class LandoLagoon extends parent {
    constructor(id, options = {}) {
      // Get our options
      options = _.merge({}, config, options);
      // Get the lagoon config weve loaded and parsed
      const lagoonConfig = _.get(options, '_app.lagoon', {});

      // Map into lando services
      options.services = getLandoServices(lagoonConfig.services);
      // Add in any additional dev services eg mailhog we need
      options.services = getLandoAuxServices(options.services, options._app._config);

      // Map into lando tooling commands
      options.tooling = getLandoTooling(options.services);
      // If we have a SQL service then add in the db import/export commands
      const sqlServices = getSQLServices(options.services);
      if (!_.isEmpty(sqlServices)) {
        const firstDbService = _.first(sqlServices);
        options.tooling = _.merge({}, options.tooling, getDBUtils(firstDbService.name));
      }
      // If we have the lagoong cli then add that in as well
      if (_.has(options, 'services.lagooncli')) {
        options.tooling.lagoon = {service: 'lagooncli', cmd: '/lagoon', user: 'root'};
      }

      // Inquirer our keys as needed
      const keys = getKeys(options._app.lagoonKeys);
      // Get the pull and push
      options.tooling.pull = getPull(options, keys, options._app._lando);
      options.tooling.push = getPush(options, keys, options._app._lando);

      // If we have a key for this remote lets add it to our tooling
      if (_.has(options, '_app.meta.key')) {
        const parsedKey = parseKey(options._app.meta.key);
        const upstreamKey = path.join('/user', path.relative(os.homedir(), parsedKey.keyPath));
        _.forEach(options.tooling, command => {
          command.env = _.merge({}, command.env, {LAGOON_SSH_KEY: upstreamKey});
        });
      }

      // Map into lando proxy routes
      options.proxy = getLandoProxyRoutes(options.services, _.get(options, '_app.lagoon.domain'));

      // Send downstream
      super(id, options);
    };
  },
};
