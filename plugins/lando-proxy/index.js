'use strict';

// Modules
const _ = require('lodash');
const path = require('path');
const utils = require('./lib/utils');

// Default config values
const defaultConfig = {
  proxy: 'ON',
  proxyName: 'landoproxyhyperion5000gandalfedition',
  proxyCache: 'proxyCache',
  proxyCommand: [
    '/entrypoint.sh',
    '--log.level=DEBUG',
    '--api.insecure=true',
    '--api.dashboard=false',
    '--providers.docker=true',
    '--entrypoints.https.address=:443',
    '--entrypoints.http.address=:80',
    '--providers.docker.exposedbydefault=false',
    '--providers.file.directory=/proxy_config',
    '--providers.file.watch=true',
  ],
  proxyCustom: {},
  proxyDefaultCert: '/certs/cert.crt',
  proxyDefaultKey: '/certs/cert.key',
  proxyHttpPort: '80',
  proxyHttpsPort: '443',
  proxyHttpFallbacks: ['8000', '8080', '8888', '8008'],
  proxyHttpsFallbacks: ['444', '4433', '4444', '4443'],
  proxyPassThru: true,
};

module.exports = lando => {
  // Add in some computed config eg things after our config has been settled
  lando.events.on('post-bootstrap-config', ({config}) => {
    lando.log.verbose('building proxy config...');
    // Set some non dependent things
    config.proxyContainer = `${lando.config.proxyName}_proxy_1`;
    config.proxyCurrentPorts = {http: config.proxyHttpPort, https: config.proxyHttpsPort};
    config.proxyDir = path.join(lando.config.userConfRoot, 'proxy');
    config.proxyHttpPorts = _.flatten([config.proxyHttpPort, config.proxyHttpFallbacks]);
    config.proxyHttpsPorts = _.flatten([config.proxyHttpsPort, config.proxyHttpsFallbacks]);
    config.proxyLastPorts = lando.cache.get(lando.config.proxyCache);
    config.proxyNet = `${config.proxyName}_edge`;
    config.proxyScanHttp = utils.ports2Urls(config.proxyHttpPorts, false, config.proxyBindAddress);
    config.proxyScanHttps = utils.ports2Urls(config.proxyHttpsPorts, true, config.proxyBindAddress);
    // And dependent things
    config.proxyConfigDir = path.join(config.proxyDir, 'config');
  });

  // Return config defaults to rebase
  return {
    config: _.merge({}, defaultConfig, {
      proxyBindAddress: _.get(lando, 'config.bindAddress', '127.0.0.1'),
      proxyDomain: lando.config.domain,
      proxyIp: _.get(lando.config, 'engineConfig.host', '127.0.0.1'),
    }),
  };
};
