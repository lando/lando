'use strict';

module.exports = lando => ({
  config: {
    networkBridge: 'lando_bridge_network',
  },
});


/*
  // Helper to root run commands
  const runRoot = (services, cmd, app) => lando.engine.run(_.map(services, (service, name) => ({
    id: [service._app, name, '1'].join('_'),
    cmd: cmd,
    compose: app.compose,
    project: app.name,
    opts: {
      app: app,
      detach: true,
      mode: 'attach',
      user: 'root',
      services: [name],
    },
  })));

  // Define some things

*/
