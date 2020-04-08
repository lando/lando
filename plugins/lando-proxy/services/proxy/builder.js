'use strict';

// Modules
const _ = require('lodash');

/*
 * Helper to get core proxy service
 */
const getProxy = (domain, cert, key, version = 'unknown') => {
  const certs = [cert, key].join(',');
  return {
    services: {
      proxy: {
        image: 'traefik:1.6.3-alpine',
        command: [
          '/entrypoint.sh',
          '--defaultEntryPoints=https,http',
          '--docker',
          `--docker.domain=${domain}`,
          '--entryPoints="Name:http Address::80"',
          `--entrypoints="Name:https Address::443 TLS:${certs}"`,
          '--logLevel=DEBUG',
          '--web',
        ].join(' '),
        environment: {
          LANDO_VERSION: version,
        },
        labels: {
          'traefik.frontend.rule': `Host:mustachedmanwiththecape`,
        },
        networks: ['edge'],
        volumes: [
          '/var/run/docker.sock:/var/run/docker.sock',
          '/dev/null:/traefik.toml',
        ],
      },
    },
    networks: {
      edge: {
        driver: 'bridge',
      },
    },
  };
};

/*
 * Helper to get proxy ports service
 */
const getPorts = (http, https, dash) => ({
  services: {
    proxy: {
      ports: [
        [http, '80'].join(':'),
        [https, '443'].join(':'),
        [dash, '8080'].join(':'),
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
    refreshCerts: true,
  },
  // @TODO: ssl=true here currently exposes two ports into 443, should we separate ssl/addcerts?
  builder: (parent, config) => class LandoProxy extends parent {
    constructor(http, https, options) {
      const proxy = getProxy(options.proxyDomain, options.proxyCert, options.proxyKey, options.version);
      const ports = getPorts(http, https, options.proxyDash);
      const augment = {
        env: _.cloneDeep(options.appEnv),
        labels: _.cloneDeep(options.appLabels),
        userConfRoot: options.userConfRoot,
      };
      super('proxy', _.merge({}, config, augment), proxy, ports);
    };
  },
};
