'use strict';

/*
 * The lowest level lando service
 */
module.exports = {
  name: '_appserver',
  parent: '_lando',
  builder: parent => class LandoAppserver extends parent {
    constructor(id, options = {}, ...sources) {
      super(id, options, ...sources);
    };
  },
};

/*

  const info = (name, config) => {
    // Start up an info collector
    const info = {};

    // Add in appserver basics
    info.via = config.via;
    info.webroot = _.get(config, 'webroot', '.');

    // Show the config files being used if they are custom
    if (!_.isEmpty(config.config)) {
      info.config = config.config;
    }
    // Return the collected info
    return info;
  };
*/
