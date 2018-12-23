'use strict';

module.exports = lando => {
  // Modules
  const lamp = require('./../lamp/lamp')(lando);

  /*
   * Helper to return proxy config
   */
  const proxy = name => {
    return {
      nginx: [
        [name, lando.config.proxyDomain].join('.'),
      ],
    };
  };

  /*
   * Build out LEMP
   */
  const build = (name, config) => {
    // Start by cheating
    const build = lando.recipes.build(name, 'lamp', config);
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
    getPhar: lamp.getPhar,
  };
};
