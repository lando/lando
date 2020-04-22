'use strict';

// Modules
const _ = require('lodash');
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
    '--providers.file.directory=/lando/proxy/config',
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
    config.proxyNet = `${config.proxyName}_edge`;
    config.proxyHttpPorts = _.flatten([config.proxyHttpPort, config.proxyHttpFallbacks]);
    config.proxyHttpsPorts = _.flatten([config.proxyHttpsPort, config.proxyHttpsFallbacks]);
    config.proxyScanHttp = utils.ports2Urls(config.proxyHttpPorts, false, config.proxyBindAddress);
    config.proxyScanHttps = utils.ports2Urls(config.proxyHttpsPorts, true, config.proxyBindAddress);
    config.proxyCurrentPorts = {http: config.proxyHttpPort, https: config.proxyHttpsPort};
    config.proxyLastPorts = lando.cache.get(lando.config.proxyCache);
    config.proxyContainer = `${lando.config.proxyName}_proxy_1`;
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
