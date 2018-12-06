'use strict';

// Modules
const _ = require('lodash');

// Some helpful vars
const port = '80';
const securePort = '443';
const fallbacks = ['8000', '8080', '8888', '8008'];
const secureFallbacks = ['444', '4433', '4444', '4443'];

// Default config values
const defaultConfig = {
  proxy: 'ON',
  proxyCert: '/certs/cert.crt',
  proxyKey: '/certs/cert.key',
  proxyName: 'landoproxyhyperion5000gandalfedition',
  proxyDash: '58087',
  proxyHttpPort: port,
  proxyHttpsPort: securePort,
  proxyHttpFallbacks: fallbacks,
  proxyHttpsFallbacks: secureFallbacks,
};

module.exports = lando => {
  return {
    config: _.merge({}, defaultConfig, {
      proxyDomain: lando.config.domain,
      proxyNet: [defaultConfig.proxyName, 'edge'].join('_'),
      proxyHttpPorts: _.flatten([port, fallbacks]),
      proxyHttpsPorts: _.flatten([securePort, secureFallbacks]),
    }),
  };
};

/*
proxyRunner = proxy.compose(lando.config.proxyProxyFile, lando.config.proxyPortsFile, proxyName);
*/
