'use strict';

// Modules
const _ = require('lodash');
const url = require('url');

/*
 * Helper to extract ports from inspect data
 */
exports.pp = (data, preferredHttp, preferredHttps) => {
  // Paths
  const httpPath = 'NetworkSettings.Ports.80/tcp[0].HostPort';
  const httpsPath = 'NetworkSettings.Ports.443/tcp[0].HostPort';
  // Return
  return {
    http: _.get(data, httpPath, preferredHttp),
    https: _.get(data, httpsPath, preferredHttps),
  };
};

/*
 * Returns the proxy compose object
 */
exports.compose = (defaults, ports, project) => ({
  compose: [defaults, ports],
  project: project,
  opts: {
    services: ['proxy'],
    noRecreate: false,
  },
});

/*
 * Create the default service object
 */
exports.defaults = domain => {
  // Get some stuff for our things
  const certs = ['/certs/cert.crt', '/certs/cert.key'].join(',');
  const cmd = [
    '/entrypoint.sh',
    '--defaultEntryPoints=https,http',
    '--docker',
    '--docker.domain=' + domain,
    '--entryPoints="Name:http Address::80"',
    '--entrypoints="Name:https Address::443 TLS:' + certs + '"',
    '--logLevel=DEBUG',
    '--web',
  ].join(' ');

  // Proxy service
  const proxy = {
    image: 'traefik:1.6.3-alpine',
    entrypoint: '/lando-entrypoint.sh',
    command: cmd,
    labels: {
      'io.lando.container': 'TRUE',
      'io.lando.service-container': 'TRUE',
    },
    environment: {
      LANDO_APP_NAME: 'proxy',
      LANDO_SERVICE_TYPE: 'proxy',
      LANDO_SERVICE_NAME: 'proxy',
      LANDO_UPDATE: '3',
    },
    networks: ['edge'],
    volumes: [
      '/var/run/docker.sock:/var/run/docker.sock',
      '/dev/null:/traefik.toml',
      '$LANDO_ENGINE_SCRIPTS_DIR/lando-entrypoint.sh:/lando-entrypoint.sh',
      '$LANDO_ENGINE_SCRIPTS_DIR/add-cert.sh:/scripts/add-cert.sh',
      '$LANDO_ENGINE_CONF:/lando',
    ],
  };

  // Get the new proxy service
  return {
    version: '3.2',
    services: {proxy: proxy},
    networks: {edge: {driver: 'bridge'}},
  };
};

/*
 * Create the proxy service object
 */
exports.build = (proxyDash, http, https) => {
  // Proxy service
  const proxy = {
    ports: [
      [http, '80'].join(':'),
      [https, '443'].join(':'),
      [proxyDash, 8080].join(':'),
    ],
  };

  // Get the new proxy service
  return {
    version: '3.2',
    services: {proxy: proxy},
  };
};

/*
 * Create the proxy service object
 */
exports.getUrls = (hosts, secure, suffix) => {
  // Protocol
  const protocol = (secure) ? 'https://' : 'http://';

  // Collect all urls to scan
  return _.map(hosts, port => protocol + [suffix, port].join(':'));
};

/*
 * Get the available port from scanned urls
 */
exports.getPort = data => {
  // Get the first available URL
  const u = _.first(_.filter(data, datum => datum.status === false));
  // Return port
  return url.parse(u.url).port;
};
