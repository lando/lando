'use strict';

// Modules
const _ = require('lodash');
const hasher = require('object-hash');
const url = require('url');

/*
 * Helper to get URLs for app info and scanning purposes
 */
const getInfoUrls = (url, ports, hasCerts = false) => {
  // Start with the default
  const urls = [`http://${url.host}${ports.http === '80' ? '' : `:${ports.http}`}${url.pathname}`];
  // Add https if we can
  if (hasCerts) {
    urls.push(`https://${url.host}${ports.https === '443' ? '' : `:${ports.https}`}${url.pathname}`);
  }
  // Return
  return urls;
};

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
 * Helper to get the trafix rule
 */
exports.getRule = rule => {
  // Start with the rule we can assume
  const hostRegex = rule.host.replace(new RegExp('\\*', 'g'), '{wildcard:[a-z0-9-]+}');
  const rules = [`HostRegexp(\`${hostRegex}\`)`];
  // Add in the path prefix if we can
  if (rule.pathname.length > 1) rules.push(`PathPrefix(\`${rule.pathname}\`)`);
  return rules.join(' && ');
};

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
exports.parse2Info = (urls, ports, hasCerts = false) => _(urls)
  .map(url => exports.parseUrl(url))
  .flatMap(url => getInfoUrls(url, ports, hasCerts))
  .value();

/*
 * Parse urls into SANS
 */
exports.parse2Sans = urls => _(urls)
  .map(url => exports.parseUrl(url).host)
  .map((host, index) => `DNS.${10+index} = ${host}`)
  .value()
  .join('\n');

/*
 * Parse hosts for traefik
 */
exports.parseConfig = (config, sslReady = []) => _(config)
  .map((urls, service) => ({
    environment: {
      LANDO_PROXY_NAMES: exports.parse2Sans(urls),
    },
    name: service,
    labels: exports.parseRoutes(service, urls, sslReady)}))
  .value();

/*
 * Helper to parse the routes
 */
exports.parseRoutes = (service, urls = [], sslReady, labels = {}) => {
  // Prepare our URLs for traefik
  const parsedUrls = _(urls)
    .map(url => exports.parseUrl(url))
    .map(parsedUrl => _.merge({}, parsedUrl, {id: hasher(parsedUrl)}))
    .uniqBy('id')
    .value();

  // Add things into the labels
  _.forEach(parsedUrls, rule => {
    // Set the http entrypoint
    labels[`traefik.http.routers.${rule.id}.entrypoints`] = 'http';
    // Rules are grouped by port so the port for any rule should be fine
    labels[`traefik.tcp.services.${rule.id}.loadbalancer.server.port`] = rule.port;
    // Set the route rules
    labels[`traefik.http.routers.${rule.id}.rule`] = exports.getRule(rule);
    // Add in any path stripping middleware we need it
    if (rule.pathname.length > 1) {
      labels[`traefik.http.routers.${rule.id}.middlewares`] = `${rule.id}-stripprefix`;
      labels[`traefik.http.middlewares.${rule.id}-stripprefix.stripprefix.prefixes`] = rule.pathname;
    }

    // Add https if we can
    if (_.includes(sslReady, service)) {
      labels['io.lando.proxy.has-certs'] = true;
      labels[`traefik.http.routers.${rule.id}-secured.entrypoints`] = 'https';
      labels[`traefik.http.routers.${rule.id}-secured.rule`] = exports.getRule(rule);
      labels[`traefik.http.routers.${rule.id}-secured.tls`] = true;
      labels[`traefik.tcp.services.${rule.id}-secured.loadbalancer.server.port`] = rule.port;
      if (rule.pathname.length > 1) {
        labels[`traefik.http.routers.${rule.id}-secured.middlewares`] = `${rule.id}-stripprefix-secured`;
        labels[`traefik.http.middlewares.${rule.id}-stripprefix-secured.stripprefix.prefixes`] = rule.pathname;
      }
    }
  });
  return labels;
};

/*
 * Helper to parse a url
 */
exports.parseUrl = string => {
  // We add the protocol ourselves, so it can be parsed. We also change all *
  // occurrences for our magic word __wildcard__, because otherwise the url parser
  // won't parse wildcards in the hostname correctly.
  const parsedUrl = url.parse(`http://${string}`.replace(/\*/g, '__wildcard__'));
  return {
    host: parsedUrl.hostname.replace(/__wildcard__/g, '*'),
    port: parsedUrl.port || '80',
    pathname: parsedUrl.pathname || '',
  };
};

/*
 * Maps ports to urls
 */
exports.ports2Urls = (ports, secure = false, hostname = '127.0.0.1') => _(ports)
  .map(port => url.format({protocol: (secure) ? 'https' : 'http', hostname, port}))
  .value();
