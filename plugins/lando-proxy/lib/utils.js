'use strict';

// Modules
const _ = require('lodash');
const url = require('url');

/*
 * Reduces urls to first open port
 */
exports.getFirstOpenPort = (scanner, urls = []) => scanner(urls, {max: 1, waitCodes: []})
  .filter(url => url.status === false)
  .map(port => _.last(port.url.split(':')))
  .then(ports => ports[0]);

/*
 * Helper to determine what ports have changed
 */
exports.needsProtocolScan = (current, last, status = {http: true, https: true}) => {
  if (!last) return status;
  if (current.http === last.http) status.http = false;
  if (current.https === last.https) status.https = false;
  return status;
};

/*
 * Helper to get proxy runner
 */
exports.getProxyRunner = (project, files) => ({
  compose: files,
  project: project,
  opts: {
    services: ['proxy'],
    noRecreate: false,
  },
});

/*
 * Get a list of URLs and their counts
 */
exports.getUrlsCounts = config => _(config)
  .flatMap(service => _.uniq(service))
  .countBy()
  .value();

/*
 * Parse config into urls we can merge to app.info
 */
exports.parse2Info = (urls, ports) => _(urls)
  .map(url => exports.parseUrl(url).host)
  .flatMap(url => [`http://${url}`, `https://${url}`])
  .map(url => (_.startsWith(url, 'http://') && ports.http !== '80') ? `${url}:${ports.http}` : url)
  .map(url => (_.startsWith(url, 'https://') && ports.https !== '443') ? `${url}:${ports.https}` : url)
  .value();

/*
 * Parse hosts for traefik
 */
exports.parseConfig = config => _(config)
  .map((urls, service) => ({name: service, labels: exports.parseRoutes(urls)}))
  .value();

/*
 * Parse hosts for traefik
 */
exports.parseHosts = hosts => hosts.join(',').replace(new RegExp('\\*', 'g'), '{wildcard:[a-z0-9-]+}');

/*
 * Helper to parse the routes
 */
exports.parseRoutes = urls => _(urls)
  .uniq()
  .map(url => exports.parseUrl(url))
  .groupBy('port')
  .map((urls, port) => ({
    [`traefik.${port}.frontend.rule`]: 'HostRegexp:' + exports.parseHosts(_.map(urls, 'host')),
    [`traefik.${port}.port`]: _.toString(port),
  }))
  .thru(labels => _.reduce(labels, (sum, label) => _.merge(sum, label), {}))
  .value();

/*
 * Helper to parse a url
 */
exports.parseUrl = url => ({
  host: _.head(url.split(':')),
  port: (_.size(url.split(':')) === 2) ? _.last(url.split(':')) : '80',
});

/*
 * Maps ports to urls
 */
exports.ports2Urls = (ports, secure = false, hostname = '127.0.0.1') => _(ports)
  .map(port => url.format({protocol: (secure) ? 'https' : 'http', hostname, port}))
  .value();


