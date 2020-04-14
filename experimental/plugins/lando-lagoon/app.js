'use strict';

// Modules
const _ = require('lodash');

/*
 * @TODO
 */
module.exports = (app, lando) => {
  app.events.on('pre-rebuild', 9, () => {
    _.forEach(_.get(app, 'config.services', {}), (config, name) => {
      if (_.has(config, 'lagoon.build')) {
        _.remove(app.opts.pullable, item => item === name);
        app.opts.local.push(name);
      }
    });
  });
};
