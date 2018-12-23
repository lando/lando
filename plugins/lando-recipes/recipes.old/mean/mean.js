'use strict';

module.exports = lando => {
  // Modules
  const _ = lando.node._;

  /*
   * Helper to return proxy config
   */
  const proxy = name => {
    return {
      appserver: [
        [name, lando.config.proxyDomain].join('.'),
      ],
    };
  };

  /*
   * Helper to return services config
   */
  const services = config => {
    // Get some options
    const nodeVersion = _.get(config, 'node', '6.10');
    const mongoVersion = _.get(config, 'mongo', '3.5');

    // Build our default set of services
    const services = {
      appserver: {
        type: 'node:' + nodeVersion,
        command: _.get(config, 'command', 'npm start'),
      },
      database: {
        type: 'mongo:' + mongoVersion,
        portforward: true,
      },
    };

    // Mix in any additional config
    if (_.has(config, 'conf')) {
      // Start setting config
      services.database.config = {};
      // Set custom db conf
      if (_.has(config, 'conf.database')) {
        services.database.config = config.conf.database;
      }
    }

    // Mix in globals
    if (_.has(config, 'globals')) {
      services.appserver.globals = config.globals;
    }

    // Return that thang
    return services;
  };

  /*
   * Helper to return tooling config
   */
  const tooling = () => {
    // Get our default tooling opts
    const tooling = {
      node: {
        service: 'appserver',
      },
      npm: {
        service: 'appserver',
      },
      yarn: {
        service: 'appserver',
      },
      mongo: {
        service: 'database',
        description: 'Drop into the mongo shell',
      },
    };

    // Return the toolz
    return tooling;
  };

  /*
   * Build out MEAN
   */
  const build = (name, config) => {
    // Start up our build
    const build = {};

    // Get our things
    build.proxy = proxy(name);
    build.services = services(config);
    build.tooling = tooling();

    // Return the things
    return build;
  };

  // Return things
  return {
    build: build,
    configDir: __dirname,
    webroot: false,
  };
};
