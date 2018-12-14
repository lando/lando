'use strict';

// Modules
const _ = require('lodash');
const utils = require('./lib/utils');

// Default config values
const defaultConfig = {
  proxy: 'ON',
  proxyCert: '/certs/cert.crt',
  proxyKey: '/certs/cert.key',
  proxyName: 'landoproxyhyperion5000gandalfedition',
  proxyDash: '58087',
  proxyCache: 'proxyCache',
  proxyHttpPort: '80',
  proxyHttpsPort: '443',
  proxyHttpFallbacks: ['8000', '8080', '8888', '8008'],
  proxyHttpsFallbacks: ['444', '4433', '4444', '4443'],
};

module.exports = lando => {
  // Add in some computed config eg things after our config has been settled
  lando.events.on('post-bootstrap-config', ({config}) => {
    config.proxyNet = `${config.proxyName}_edge`;
    config.proxyHttpPorts = _.flatten([config.proxyHttpPort, config.proxyHttpFallbacks]);
    config.proxyHttpsPorts = _.flatten([config.proxyHttpsPort, config.proxyHttpsFallbacks]);
    config.proxyScanHttp = utils.ports2Urls(config.proxyHttpPorts, false, config.proxyIp);
    config.proxyScanHttps = utils.ports2Urls(config.proxyHttpsPorts, true, config.proxyIp);
    config.proxyCurrentPorts = {http: config.proxyHttpPort, https: config.proxyHttpsPort};
    config.proxyLastPorts = lando.cache.get(lando.config.proxyCache);
    config.proxyContainer = `${lando.config.proxyName}_proxy_1`;
  });
  // Return config defaults to rebase
  return {
    config: _.merge({}, defaultConfig, {
      proxyDomain: lando.config.domain,
      proxyIp: _.get(lando.config, 'engineConfig.host', '127.0.0.1'),
    }),
  };
};
