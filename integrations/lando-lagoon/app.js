'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const keys = require('./lib/keys');
const lagoonConf = require('./lib/config');
const path = require('path');
const warnings = require('./lib/warnings');
const {getLandoServices} = require('./lib/services');

const LagoonApi = require('./lib/api');

// Only do this on lagoon recipes
module.exports = (app, lando) => {
  if (_.get(app, 'config.recipe') === 'lagoon') {
    // Indicate awareness
    app.log.verbose('identified a lagoon app');

    // Start by loading in all the laggon files we can
    app.lagoon = {config: lagoonConf.loadConfigFiles(app.root)};
    // And then augment with a few other things
    app.lagoon.domain = `${app.name}.${app._config.domain}`;
    app.lagoon.containers = _.keys(_.get(app.lagoon, 'config.compose.services', {})),
    app.log.silly('loaded lagoon config files', app.lagoon);

    // Set the app caches, validate keys and update key cache
  _.forEach(['pull', 'push'], command => {
    app.events.on(`post-${command}`, (config, answers) => {
      // Only run if answer.auth is set, this allows these commands to all be
      // overriden without causing a failure here
      if (keys.getPreferredKey(answers)) {
        const api = new LagoonApi(keys.getPreferredKey(answers), lando);
        return api.auth().then(() => api.whoami().then(me => {
          // if this is a generated key lets move it
          if (_.has(answers, 'auth-generate')) {
            // Get the generated key
            const auth = answers['auth-generate'];
            const generatedKey = _.first(auth.split('@'));
            // Get the new key
            const newKey = path.join(lando.config.userConfRoot, 'keys', `lagoon-${me.id}`);
            // Move the key
            fs.renameSync(generatedKey, newKey);
            answers['auth-generate'] = _.replace(auth, generatedKey, newKey);
            // Remove older stuff
            fs.unlinkSync(`${generatedKey}.pub`);
          }

          // Update lando's store of lagoon keys
          const newKey = {date: _.toInteger(_.now() / 1000), key: keys.getPreferredKey(answers), email: me.email};
          lando.cache.set(app.lagoonKeyCache, keys.sortKeys(app.lagoonKeys, [newKey]), {persist: true});
          // Update the app metadata cache
          const metaData = lando.cache.get(app.metaCache);
          lando.cache.set(app.metaCache, _.merge({}, metaData, newKey), {persist: true});
          // Wipe out the apps tooling cache to reset with the new key
          lando.cache.remove(`${app.name}.tooling.cache`);
        }));
      }
    });
  });

    /*
     * This event is intended to parse and interpret the lagoon config files
     * loaded above into things we can use elsewhere, eg if there is any useful
     * non-trivial data mutation that needs to happen ANYWHERE else in the
     * recipe it probably should happen here
     */
    app.events.on('pre-init', 1, () => {
      // Error if we don't have at least one docker service or any lagoon config
      if (_.isEmpty(app.lagoon.containers) || _.isEmpty(app.lagoon.config.lagoon)) {
        throw Error(`The lagoon recipe requires a .lagoon.yml in ${app.root} but we couldn't find one! ` +
          `Check out https://docs.lando.dev/config/lagoon.html to see how all the magic works!`);
      }

      // Get the raw lagoon config
      const lagoonConfig = app.lagoon.config;
      // Reset the lando app name to be the project name
      app.name = _.get(lagoonConfig, 'lagoon.project', app.name);

      // Add the parsed services config
      app.lagoon.services = lagoonConf.parseServices(lagoonConfig.compose.services, app.config);
      app.log.verbose('parsed lagoon services');
      app.log.silly('lagoon services ares', app.lagoon.services);

      // Load in other stuff keys tokens and other meta at the most opportune moment
      app.lagoonKeyCache = 'lagoon.keys';
      app.lagoonKeys = lando.cache.get(app.lagoonKeyCache);
    });

    /*
     * Warn user of unsupported services
     * This event exists to
     */
    app.events.on('post-start', 9, () => {
      const allServices = _.map(app.lagoon.services, 'name');
      const supportedServices = _.map(getLandoServices(app.lagoon.services), 'name');
      const unsupportedServices = _.difference(allServices, supportedServices);
      if (!_.isEmpty(unsupportedServices)) {
        app.addWarning(warnings.unsupportedServices(unsupportedServices.join(', ')));
      }
    });

    // Fix pullable/local services for lagoon things
    app.events.on('pre-rebuild', 9, () => {
      _.forEach(_.get(app, 'config.services', {}), (config, name) => {
        if (_.has(config, 'lagoon.build')) {
          _.remove(app.opts.pullable, item => item === name);
          app.opts.local.push(name);
        }
      });
    });
  }
};
