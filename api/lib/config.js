'use strict';

const _ = require('lodash');

/*
 * Helper to load the config things
 */
module.exports = (config = {}) => {
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
    config.LANDO_API_PORT = pconfig.port;
  }

  // Return config
  return config;
};
