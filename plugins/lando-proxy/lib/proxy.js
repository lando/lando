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
