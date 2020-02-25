'use strict';

const _ = require('lodash');

/*
 * Helper to load the config things
 */
module.exports = (config = {}) => {
  // Get plugins
  const plugins = config.LANDO_METRICS_PLUGINS || [];

  // Merge in plugin config keys
  _.forEach(_.map(plugins, plugin => plugin.config), key => {
    config[key] = {};
  });

  // Merge in .env file
  require('dotenv').config();

  // Merge in process.env as relevant
  _.forEach(_.keys(config), key => {
    if (_.has(process.env, key)) {
      config[key] = process.env[key];
    }
  });

  // Merge in platformsh stuff
  if (!_.isEmpty(process.env.PLATFORM_ENVIRONMENT)) {
    // Get platform config
    const pconfig = require('platformsh').config();
    // Load in platform consts
    if (!_.isEmpty(pconfig.constiables)) {
      _.forEach(pconfig.constiables, (value, key) => {
        config[key] = value;
      });
    }
    // Set the port
    config.LANDO_METRICS_PORT = pconfig.port;
  }

  // Make sure we JSON parse relevant config
  _.forEach(_.map(plugins, plugin => plugin.config), key => {
    if (typeof config[key] === 'string') {
      config[key] = JSON.parse(config[key]);
    }
  });
  // Return config
  return config;
};
