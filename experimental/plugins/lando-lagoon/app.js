'use strict';

// Modules
const _ = require('lodash');

/*
 * @TODO
 */
module.exports = (app, lando) => {
  // Only do this for lagoon things
  if (_.get(app, 'config.recipe') === 'lagoon') {
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
