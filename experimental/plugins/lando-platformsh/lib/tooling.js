'use strict';

// Modules
const _ = require('lodash');

/*
 * Helper to get php related tooling commands
 */
const getPhpTooling = (service = 'app') => ({composer: {service}, php: {service}});

/*
 * Helper to map lagoon type data to a lando service
 */
const getToolingByType = app => {
  switch (app.platformsh.type) {
    case 'php': return getPhpTooling(app.name);
    default: return {};
  };
};

/*
 * Maps parsed platform config into related Lando things
 */
exports.getAppTooling = app => _.merge({}, {platform: {service: app.name}}, getToolingByType(app));
