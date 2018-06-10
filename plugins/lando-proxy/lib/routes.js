'use strict';

// Modules
var _ = require('lodash');
var u = require('url');

/*
 * Parse a proxy config file into info urls
 */
exports.map2Info = function(config, ports) {

  // Collect info
  var info = {};

  // Map the things
  _.forEach(config, function(urls, service) {
    if (!_.isEmpty(urls) && _.isString(urls[0])) {

      // Start collecting urls
      info[service] = {urls: []};

      // Loop through all the urls and ports
      _.forEach(urls, function(url) {
        _.forEach(ports, function(port, protocol) {

          // build the new url
          var newer = {
            protocol: protocol + ':',
            hostname: url.split(':')[0]
          };

          // Add a port if needed
          if (port !== '80' && port !== '443') {
            newer.port = port;
          }

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
exports.compose = function(netName) {
  return {
    version: '3.2',
    networks: {'lando_proxyedge': {external: {name: netName}}},
    services: {}
  };
};

/*
 * Parse hosts for traefik
 */
exports.parseHosts = function(hosts) {
  var hRegex = new RegExp('\\*', 'g');
  return hosts.join(',').replace(hRegex, '{wildcard:[a-z0-9-]+}');
};

/*
 * Strip array of hosts of ports
 */
exports.stripPorts = function(urls) {
  return _.map(urls, function(u) {
    var hasProtocol = !_.isEmpty(u.split('://')[1]);
    var f = (hasProtocol) ? (u.split('://')[1]) : (u.split('://')[0]);
    return f.split(':')[0];
  });
};

/*
 * Map new proxy config format to old one
 */
exports.map2Legacy = function(data, name, proxyDomain) {

  // Start a config collector
  var config = [];
  var secures = [];

  // Mock add "secure" urls to all our proxy domains
  _.forEach(data, function(datum) {
    secures.push([datum.split(':')[0], '443'].join(':'));
  });

  // Map to array of port/host objects
  var phosts = _.map(data.concat(secures), function(datum) {
    return {
      port: _.get(datum.split(':'), '[1]', '80') + '/tcp',
      host: datum.split(':')[0]
    };
  });

  // Start to build the config object
  _.forEach(_.groupBy(phosts, 'port'), function(value, key) {
    config.push({
      port: key,
      hosts: _.map(value, 'host')
    });
  });

  // Determine the hostname situation
  _.forEach(config, function(service) {

    // Handle secure
    if (service.port === '443/tcp') {
      service.secure = true;
    }

    // Basic collectors
    var subdomains = [];
    var custom = [];

    // Go through each host and try to build the legacy config
    _.forEach(service.hosts, function(host) {

      // Handle proxyDomain hosts
      if (_.endsWith(host, proxyDomain)) {

        // Save the original
        var original = host;

        // Strip opts
        var sopts = {
          length: host.length - proxyDomain.length - 1,
          omission: ''
        };

        // Start to strip the host down
        host = _.truncate(host, sopts);

        // Set default if stripped is the app.name
        if (host === name) {
          service.default = true;
        }

        // Strip more to remove any app.name refs
        if (_.endsWith(host, name)) {
          sopts.length = host.length - name.length - 1;
          host = _.truncate(host, sopts);
          if (!_.isEmpty(host)) {
            subdomains.push(host);
          }
        }

        // Else should be custom
        else {
          custom.push(original);
        }

      }

      // Must be a custom domain
      else {
        custom.push(host);
      }
    });

    // Add in subdomains if they are not empty
    if (!_.isEmpty(subdomains)) {
      service.subdomains = subdomains;
    }

    // Ditto custom domains
    if (!_.isEmpty(custom)) {
      service.custom = custom;
    }

    // Remove the old hosts
    delete service.hosts;

  });

  // Return the mapped things
  return config;

};

/*
 * Legacy parse a proxy config object into an array of URLs
 */
exports.getLegacyRouteUrls = function(route, name, ports, domain) {

  // Start with a hostnames collector
  var hostnames = [];

  // Handle 'default' key
  if (route.default) {
    hostnames.push([name, domain].join('.'));
  }

  // Handle legacy 'hostname' key
  if (route.hostname) {
    hostnames.push([route.hostname, name, domain].join('.'));
  }

  // Handle 'subdomains'
  if (route.subdomains) {
    _.forEach(route.subdomains, function(subdomain) {
      hostnames.push([subdomain, name, domain].join('.'));
    });
  }

  // Handle 'custom'
  if (route.custom) {
    _.forEach(route.custom, function(url) {
      hostnames.push(url);
    });
  }

  // Determine whether the protocol is http or https
  var protocol = (route.secure) ? 'https://' : 'http://';

  // Return an array of parsed hostnames
  var routes = _.map(hostnames, function(hostname) {

    // Optional port TBD
    var port = '';

    // Determine whether we need to add a port
    if (!route.secure && ports.http !== '80') {
      port = ':' + ports.http;
    }

    // Or we need to add a secure port
    else if (route.secure && ports.https !== '443') {
      port = ':' + ports.https;
    }

    // Return the completed URL
    return protocol + hostname + port;

  });

  // Return the route object
  return {
    port: route.port,
    urls: routes
  };

};

/*
 * Get a list of URLs and their counts
 */
exports.getUrlsCounts = function(services) {

  // Get routes and flatten
  var routes = _.flatten(_.map(services, 'routes'));

  // Get URLs and flatten
  var urls = _.flatten(_.map(routes, 'urls'));

  // Check for duplicate URLs
  return _.countBy(urls);

};
