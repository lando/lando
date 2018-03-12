'use strict';

module.exports = function(lando) {

  // Modules
  var lamp = require('./../lamp/lamp')(lando);

  /*
   * Helper to return proxy config
   */
  var proxy = function(name) {
    return {
      nginx: [
        [name, lando.config.proxyDomain].join('.')
      ]
    };
  };

  /*
   * Build out LEMP
   */
  var build = function(name, config) {

    // Start by cheating
    var build = lando.recipes.build(name, 'lamp', config);

    // Replace the proxy
    build.proxy = proxy(name);

    // Set via to nginx
    build.services.appserver.via = config.via || 'nginx';

    // Return the things
    return build;

  };

  // Return things
  return {
    build: build,
    resetConfig: lamp.resetConfig,
    getCgr: lamp.getCgr,
    getPhar: lamp.getPhar
  };

};
