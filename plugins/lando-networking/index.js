'use strict';

// Modules
const fs = require('fs-extra');
const path = require('path');

module.exports = lando => {
  const caDir = path.join(lando.config.userConfRoot, 'certs');
  const caDomain = 'lndo.site';
  const caCert = path.join(caDir, `${caDomain}.pem`);
  const caKey = path.join(caDir, `${caDomain}.key`);
  fs.mkdirpSync(caDir);
  return {
    config: {
      appEnv: {
        LANDO_CA_CERT: '/lando/certs/' + path.basename(caCert),
        LANDO_CA_KEY: '/lando/certs/' + path.basename(caKey),
      },
      caCert,
      caDomain,
      caKey,
      caService: path.join(caDir, 'ca-setup.yml'),
      caProject: `landocasetupkenobi38ahsoka${lando.config.instance}`,
      networkBridge: 'lando_bridge_network',
    },
  };
};


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
