'use strict';

// Modules
const _ = require('lodash');
const u = require('url');

/*
 * Parse a proxy config file into info urls
 */
exports.map2Info = (config, ports) => {
  // Collect info
  const info = {};

  // Map the things
  _.forEach(config, (urls, service) => {
    if (!_.isEmpty(urls) && _.isString(urls[0])) {
      // Start collecting urls
      info[service] = {urls: []};

      // Loop through all the urls and ports
      _.forEach(urls, url => {
        _.forEach(ports, (port, protocol) => {
          // build the new url
          const newer = {
            protocol: protocol + ':',
            hostname: url.split(':')[0],
          };

          // Add a port if needed
          if (port !== '80' && port !== '443') newer.port = port;

          // And push
          info[service].urls.push(u.format(newer));
        });
      });
    }
  });

  // Return
  return info;
};

/*
 * Returns the object that needs to be mixed into services that are proxies
 */
exports.compose = netName => {
  return {
    version: '3.2',
    networks: {'lando_proxyedge': {external: {name: netName}}},
    services: {},
  };
};

/*
 * Parse hosts for traefik
 */
exports.parseHosts = hosts => {
  return hosts.join(',').replace(new RegExp('\\*', 'g'), '{wildcard:[a-z0-9-]+}');
};

/*
 * Strip array of hosts of ports
 */
exports.stripPorts = urls => _.map(urls, u => {
  const hasProtocol = !_.isEmpty(u.split('://')[1]);
  const f = (hasProtocol) ? (u.split('://')[1]) : (u.split('://')[0]);
  return f.split(':')[0];
});

/*
 * Map new proxy config format to old one
 */
exports.map2Legacy = (data, name, proxyDomain) => {
  // Start a config collector
  const config = [];
  const secures = [];

  // Mock add "secure" urls to all our proxy domains
  _.forEach(data, datum => {
    secures.push([datum.split(':')[0], '443'].join(':'));
  });

  // Map to array of port/host objects
  const phosts = _.map(data.concat(secures), datum => ({
    port: _.get(datum.split(':'), '[1]', '80') + '/tcp',
    host: datum.split(':')[0],
  }));

  // Start to build the config object
  _.forEach(_.groupBy(phosts, 'port'), (value, key) => {
    config.push({
      port: key,
      hosts: _.map(value, 'host'),
    });
  });

  // Determine the hostname situation
  _.forEach(config, service => {
    // Handle secure
    if (service.port === '443/tcp') {
      service.secure = true;
    }

    // Basic collectors
    const subdomains = [];
    const custom = [];

    // Go through each host and try to build the legacy config
    _.forEach(service.hosts, host => {
      // Handle proxyDomain hosts
      if (_.endsWith(host, proxyDomain)) {
        // Save the original
        const original = host;
        // Strip opts
        const sopts = {
          length: host.length - proxyDomain.length - 1,
          omission: '',
        };

        // Start to strip the host down
        host = _.truncate(host, sopts);

        // Set default if stripped is the app.name
        if (host === name) service.default = true;

        // Strip more to remove any app.name refs
        if (_.endsWith(host, name)) {
          sopts.length = host.length - name.length - 1;
          host = _.truncate(host, sopts);
          if (!_.isEmpty(host)) {
            subdomains.push(host);
          }
        } else {
          custom.push(original);
        }
      } else {
        custom.push(host);
      }
    });

    // Add in subdomains if they are not empty
    if (!_.isEmpty(subdomains)) service.subdomains = subdomains;

    // Ditto custom domains
    if (!_.isEmpty(custom)) service.custom = custom;

    // Remove the old hosts
    delete service.hosts;
  });

  // Return the mapped things
  return config;
};

/*
 * Legacy parse a proxy config object into an array of URLs
 */
exports.getLegacyRouteUrls = (route, name, ports, domain) => {
  // Start with a hostnames collector
  const hostnames = [];

  // Handle 'default' key
  if (route.default) hostnames.push([name, domain].join('.'));

  // Handle legacy 'hostname' key
  if (route.hostname) hostnames.push([route.hostname, name, domain].join('.'));

  // Handle 'subdomains'
  if (route.subdomains) {
    _.forEach(route.subdomains, subdomain => {
      hostnames.push([subdomain, name, domain].join('.'));
    });
  }

  // Handle 'custom'
  if (route.custom) {
    _.forEach(route.custom, url => {
      hostnames.push(url);
    });
  }

  // Determine whether the protocol is http or https
  const protocol = (route.secure) ? 'https://' : 'http://';

  // Return an array of parsed hostnames
  const routes = _.map(hostnames, hostname => {
    // Optional port TBD
    const port = '';

    // Determine whether we need to add a port
    if (!route.secure && ports.http !== '80') {
      port = ':' + ports.http;
    } else if (route.secure && ports.https !== '443') {
      port = ':' + ports.https;
    }

    // Return the completed URL
    return protocol + hostname + port;
  });

  // Return the route object
  return {
    port: route.port,
    urls: routes,
  };
};

/*
 * Get a list of URLs and their counts
 */
exports.getUrlsCounts = services => {
  // Get routes and flatten
  const routes = _.flatten(_.map(services, 'routes'));

  // Get URLs and flatten
  const urls = _.flatten(_.map(routes, 'urls'));

  // Check for duplicate URLs
  return _.countBy(urls);
};
