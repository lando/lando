'use strict';

// Modules
const _ = require('lodash');

/*
 * Helper to get core proxy service
 */
const getProxy = ({proxyCommand, proxyPassThru, proxyDomain, userConfRoot, version = 'unknown'} = {}) => {
  return {
    services: {
      proxy: {
        image: 'traefik:2.2.0',
        command: proxyCommand.join(' '),
        environment: {
          LANDO_APP_PROJECT: '_lando_',
          LANDO_EXTRA_NAMES: `DNS.100 = *.${proxyDomain}`,
          LANDO_PROXY_CONFIG_FILE: '/proxy_config/proxy.yaml',
          LANDO_PROXY_PASSTHRU: _.toString(proxyPassThru),
          LANDO_VERSION: version,
        },
        networks: ['edge'],
        volumes: [
          '/var/run/docker.sock:/var/run/docker.sock',
          `${userConfRoot}/scripts/proxy-certs.sh:/scripts/100-proxy-certs`,
          'proxy_config:/proxy_config',
        ],
      },
    },
    networks: {
      edge: {
        driver: 'bridge',
      },
    },
    volumes: {
      proxy_config: {},
    },
  };
};

/*
 * Helper to get proxy ports service
 */
const getPorts = (http, https, {proxyBindAddress = '127.0.0.1'} = {}) => ({
  services: {
    proxy: {
      ports: [
        [proxyBindAddress, http, '80'].join(':'),
        [proxyBindAddress, https, '443'].join(':'),
        `${proxyBindAddress}::8080`,
      ],
    },
  },
});

/*
 * Build traefix proxis
 */
module.exports = {
  name: '_proxy',
  parent: '_landoutil',
  config: {
    version: 'custom',
    type: 'traefix',
    name: 'proxy',
    ssl: true,
    sslExpose: false,
    refreshCerts: true,
  },
  builder: (parent, config) => class LandoProxy extends parent {
    constructor(http, https, options) {
      const proxy = getProxy(options);
      const ports = getPorts(http, https, options);
      const augment = {
        env: _.cloneDeep(options.appEnv),
        labels: _.cloneDeep(options.appLabels),
        userConfRoot: options.userConfRoot,
      };
      super('proxy', _.merge({}, config, augment), proxy, ports);
    };
  },
};
