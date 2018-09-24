'use strict';

module.exports = lando => {
  // Modules
  const _ = lando.node._;
  const fs = lando.node.fs;
  const path = require('path');
  const proxy = require('./lib/proxy');
  const routes = require('./lib/routes');

  // Fixed location of our proxy service compose file
  const proxyFile = path.join(lando.config.userConfRoot, 'proxy', 'proxy.yml');
  const portsFile = path.join(lando.config.userConfRoot, 'proxy', 'ports.yml');
  const projectName = 'landoproxyhyperion5000gandalfedition';

  // Add some config for the proxy
  // Lets so this early to make sure other plugins have proxyConf
  lando.events.on('post-bootstrap', 1, lando => {
    // Log
    lando.log.info('Configuring proxy plugin');

    // Proxy defaults
    const defaultProxyConfig = {
      proxy: 'ON',
      proxyDomain: 'lndo.site',
      proxyDash: '58086',
      proxyHttpPort: '80',
      proxyHttpsPort: '443',
      proxyHttpFallbacks: ['8000', '8080', '8888', '8008'],
      proxyHttpsFallbacks: ['444', '4433', '4444', '4443'],
      proxyNet: [projectName, 'edge'].join('_'),
      proxyRunner: proxy.compose(proxyFile, portsFile, projectName),
    };

    // Merge config over defaults
    lando.config = lando.utils.config.merge(defaultProxyConfig, lando.config);

    // Construct lists
    const http = [lando.config.proxyHttpPort, lando.config.proxyHttpFallbacks];
    const https = [lando.config.proxyHttpsPort, lando.config.proxyHttpsFallbacks];
    lando.config.proxyHttpPorts = _.flatten(http);
    lando.config.proxyHttpsPorts = _.flatten(https);

    // Log it
    lando.log.verbose('Proxy plugin configured with %j', lando.config);
    lando.log.info('Initializing proxy plugin');
  });

  // Turn the proxy off on powerdown if applicable
  lando.events.on('poweroff', () => {
    if (lando.config.proxy === 'ON' && fs.existsSync(portsFile)) {
      return lando.engine.stop(lando.config.proxyRunner);
    }
  });

  // Turn on the proxy automatically and get info about its urls
  lando.events.on('post-instantiate-app', app => {
    // If the proxy is on and our app has config
    if (lando.config.proxy === 'ON' && !_.isEmpty(app.config.proxy)) {
      // Dump defaults
      lando.yaml.dump(proxyFile, proxy.defaults(lando.config.proxyDomain));
      const scanPorts = config => {
        // Get the engine IP
        const engineIp = _.get(config, 'engineConfig.host', '127.0.0.1');
        // Get the URLs
        const u = proxy.getUrls(config.proxyHttpPorts, false, engineIp);
        const u2 = proxy.getUrls(config.proxyHttpsPorts, true, engineIp);
        // Determine the ports for our proxy
        return lando.Promise.all([
          lando.scanUrls(u, {max: 1, waitCodes: []}),
          lando.scanUrls(u2, {max: 1, waitCodes: []}),
        ])
        // Discover ports and return object
        .map(data => proxy.getPort(data))
        // More
        .then(ports => ({http: ports[0], https: ports[1]}));
      };

      /*
       * Helper to get ports from a started proxy
       */
      const getPorts = function() {
        // Scan the proxy again
        return lando.engine.scan(lando.config.proxyRunner)

        // Get its ports
        .then(data => {
          const config = lando.config;
          return proxy.pp(data, config.proxyHttpPort, config.proxyHttpsPort);
        });
      };

      app.events.on('pre-start', 1, () => {
        // Do some port discovery
        return lando.Promise.try(() => {
          // If there is no proxy file then lets scan the ports
          if (!fs.existsSync(portsFile)) {
            return scanPorts(lando.config);
          } else {
            // Inspect current proxy to make sure we don't incorrectly rebuild
            return lando.engine.scan(lando.config.proxyRunner)

            // If the proxy is running, lets make sure we hook up the ports that the proxy
            // is already using. If we don't do this the proxy will always show as "changed"
            .then(data => {
              // Get things
              const run = _.get(data, 'State.Running', false);
              const ph = lando.config.proxyHttpPort;
              const phs = lando.config.proxyHttpsPort;

              // Return active info or scanned stuff
              return (run) ? proxy.pp(data, ph, phs) : scanPorts(lando.config);
            });
          }
        })

        // Set and start the proxy
        .then(ports => {
          const proxyDash = lando.config.proxyDash;
          const data = proxy.build(proxyDash, ports.http, ports.https);

          // If we are building the proxy for the first time
          if (!fs.existsSync(portsFile)) {
            lando.log.verbose('Starting proxy for the first time');
            lando.yaml.dump(portsFile, data);
          }

          // Get the current proxy
          const proxyOld = lando.yaml.load(portsFile);

          // If the proxy is different, rebuild with new and stop the old
          if (JSON.stringify(proxyOld) !== JSON.stringify(data)) {
            lando.log.verbose('Proxy has changed, rebuilding');
            lando.yaml.dump(portsFile, data);
          }
        })

        // Try to start the proxy
        .then(() => {
          // Retry this a few times so we can cover situations like
          // https://github.com/lando/lando/issues/632
          // This is important because if the proxy fails it sort of botches the whole thing
          return lando.Promise.retry(() => {
            // Start the proxy
            return lando.engine.start(lando.config.proxyRunner)

            // If there is an error let's destroy and try to recreate
            .catch(function(error) {
              lando.log.warn('Something is wrong with the proxy! %s', error);
              lando.log.debug('Proxy error! %s', error.stack);
              lando.log.warn('Trying to take corrective action...');
              const id = [projectName, 'proxy', '1'].join('_');
              return lando.engine.destroy({id: id, opts: {force: true}}).then(() => lando.Promise.reject());
            });
          });
        })

        // Get the data and parse the services
        .then(() => {
          // At this point we can reliably get ports because we should be started
          return getPorts()

          // Parse services
          .then(ports => {
            // Transform our config into services objects
            const services = _.map(app.config.proxy || {}, (data, key) => {
              // If this is the new proxy config format lets translate it to the old one
              if (!_.isEmpty(data) && _.isString(data[0])) {
                data = routes.map2Legacy(data, app.name);
              }

              // Map each route into an object of ports and urls
              const rs = _.map(data, r => {
                const domain = lando.config.proxyDomain;
                return routes.getLegacyRouteUrls(r, app.name, ports, domain);
              });

              // Return the service
              return {app: app.name, name: key, routes: rs};
            });

            // Get a count of the URLs so we can check for dupes
            const urlCount = routes.getUrlsCounts(services);
            const hasDupes = _.reduce(urlCount, (result, count) => count > 1 || result, false);

            // Throw an error if there are dupes
            if (hasDupes) {
              lando.log.error('Duplicate URL detected: %j', urlCount);
            }

            // Return the list
            return services;
          });
        })

        // Go through those services one by one
        .map(service => {
          // Set the docker network name.
          let labels = {
            'traefik.docker.network': lando.config.proxyNet,
          };

          // Go through all routes of the service.
          service.routes.map(route => {
            // Get the port and hosts of the route.
            const port = _.get(route, 'port', '80');
            const urls = _.get(route, 'urls', []);
            const hosts = routes.stripPorts(urls);

            // Add in relevant labels if we have hosts. And skip port 443,
            // because that is already being take care of by the proxy.
            if (!_.isEmpty(hosts) && port !== '443/tcp') {
              // Get parse hosts
              const parsedHosts = routes.parseHosts(hosts);
              // Add the port specific proxy information.
              labels = lando.utils.config.merge(labels, {
                ['traefik.' + _.toString(port).replace('/tcp', '') + '.frontend.rule']: 'HostRegexp:' + parsedHosts,
                ['traefik.' + _.toString(port).replace('/tcp', '') + '.port']: _.toString(port),
              });
            }
          });

          // Add in relevant labels if we have hosts
          if (!_.isEmpty(labels)) {
            // Start building the augment
            return {
              name: service.name,
              service: {
                networks: {'lando_proxyedge': {}},
                labels: labels,
              },
            };
          }
        })

        // Spit out the proxy compose file
        .then(services => {
          // Get the tl compose object
          const compose = routes.compose(lando.config.proxyNet);

          // Loop and add in
          _.forEach(_.compact(services), service => {
            compose.services[service.name] = service.service;
          });

          // Get project name
          const project = app.project || app.name;

          // Write the services
          const projectDir = path.dirname(proxyFile);
          const fileName = [project, 'proxy', _.uniqueId()].join('-');
          const file = path.join(projectDir, fileName + '.yml');

          // Add that file to our compose list
          app.compose.push(lando.yaml.dump(file, compose));
          lando.log.verbose('App %s has proxy compose file %s', project, file);
        });
      });

      // Add proxy URLS to our app info
      app.events.on('post-info', () => {
        // If the proxy is on and our app has config
        if (lando.config.proxy === 'ON' && !_.isEmpty(app.config.proxy)) {
          // Kick off the chain by seeing if our app is up
          return lando.app.isRunning(app)
          // If app is not running then we are done
          .then(isRunning => {
            if (isRunning) {
              // Should be good to get ports
              return getPorts()
              // Map the config to a list of info urls
              .then(ports => {
                const info = routes.map2Info(app.config.proxy, ports);
                app.info = lando.utils.config.merge(app.info, info);
              });
            }
          });
        }
      });
    }
  });
};
