/*
var APP_ROOT_DIRNAME = process.env.LANDO_CORE_APP_ROOT_DIRNAME || 'Lando';
var LANDOFILE_NAME = process.env.LANDO_CORE_LANDOFILE_NAME || '.lando.yml';
var user = require('./user');

  // App identifier
  var appId = [
    _.get(opts, 'app.name', 'unknown'),
    _.get(opts, 'app.root', 'someplace')
  ];

  // Metadata to report.
  var obj = {
    action: action,
    app: hash(appId),
    type: _.get(opts, 'app.config.recipe', 'none')
  };

  // Build an array of services to send as well
  if (_.has(opts, 'app.config.services')) {
    obj.services = _.map(_.get(opts, 'app.config.services'), function(service) {
      return service.type;
    });
  }

  // Get the email
  var data = cache.get('site:meta:' + config.name);
  if (_.has(data, 'email')) {
    obj.email = _.get(data, 'email');
  }

//appConfigFilename: LANDOFILE_NAME,
//appsRoot: path.join(env.home, APP_ROOT_DIRNAME),
//appRegistry: path.join(env.userConfRoot, 'appRegistry.json'),
//cache: true,
//loadPassphraseProtectedKeys: false,


/*


/**
 * Scans URLs to determine if they are up or down.
 *
 * @since 3.0.0
 * @param {Array} urls - An array of urls like `https://mysite.lndo.site` or `https://localhost:34223`
 * @param {Object} [opts] - Options to configure the scan.
 * @param {Integer} [opts.max=7] - The amount of times to retry accessing each URL.
 * @param {Array} [opts.waitCode=[400, 502] - The HTTP codes to prompt a retry.
 * @returns {Array} An array of objects of the form {url: url, status: true|false}
 * @example
 *
 * // Scan URLs and print results
 * return lando.utils.scanUrls(['http://localhost', 'https://localhost'])
 * .then(function(results) {
 *   console.log(results);
 * });
 */
 /*
exports.scanUrls = function(urls, opts) {

  // Scan opts
  opts = {
    max: opts.max || 7,
    waitCodes: opts.waitCodes || [400, 502, 404]
  };

  // Log
  log.debug('Starting url scan with opts', opts);

  // Ping the sites for awhile to determine if they are g2g
  return Promise.map(urls, function(url) {

    // Do a reasonable amount of retries
    return Promise.retry(function() {

      // Log the attempt
      log.info('Checking to see if %s is ready.', url);

      // Send REST request.
      return new Promise(function(fulfill, reject) {

        // If URL contains a wildcard then immediately set fulfill with yellow
        // status
        if (_.includes(url, '*')) {
          return fulfill({url: url, status: true, color: 'yellow'});
        }

        // Make the actual request, lets make sure self-signed certs are OK
        rest.get(url, {rejectUnauthorized: false, followRedirects: false})

        // The URL is accesible
        .on('success', function() {
          log.verbose('%s is now ready.', url);
          fulfill({url: url, status: true, color: 'green'});
        })

        // Throw an error on fail/error
        .on('fail', function(data, response) {

          // Get the code
          var code = response.statusCode;

          // If we have a wait code try again
          if (_.includes(opts.waitCodes, code)) {
            log.debug('%s not yet ready with code %s.', url, code);
            reject({url: url, status: false, color: 'red'});
          }

          // If we have another code then we assume thing are ok
          else {
            log.debug('%s is now ready.', url);
            fulfill({url: url, status: true, color: 'green'});
          }

        })

        // Something else bad happened
        .on('error', reject);

      });

    }, {max: opts.max})

    // Catch any error and return an inaccesible url
    .catch(function(err) {
      log.verbose('%s is not accessible', url);
      log.debug('%s not accessible with error', url, err.message);
      return {url: url, status: false, color: 'red'};
    });

  })

  // Log and then return scan results
  .then(function(results) {
    log.debug('URL scan results', results);
    return results;
  });

};

/**
 * This adds a function so apps scan their URLS when they start up
 *
 * Specifically, this will try to determine which URLS are reachable.
 *
 * @name scan
 */
/*
'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;

  // Get the app object so we can do app things
  lando.events.on('post-instantiate-app', function(app) {

    // Scan our URLs and add a list of them and their status to the app
    app.events.on('post-start', 9, function() {

      // Get app URLs
      var urls = _.filter(_.flatMap(app.info, 'urls'), _.identity);

      // Scan the urls
      return lando.utils.scanUrls(urls, {max: 17})

      // Add our URLS to the app
      .then(function(urls) {
        app.urls = urls;
      });

    });

  });

};
*/

/**
 * This bootstraps the init framework
 *
 * @name bootstrap
 */
 /*

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;

  // Add services modules to lando
  lando.events.on('post-bootstrap', 1, function(lando) {

    // Log
    lando.log.info('Initializing init framework');

    // Add init to lando
    lando.init = require('./init')(lando);

    // Load our tasks
    lando.tasks.add('destroy', require('./tasks/destroy')(lando));
    lando.tasks.add('info', require('./tasks/info')(lando));
    lando.tasks.add('list', require('./tasks/list')(lando));
    lando.tasks.add('logs', require('./tasks/logs')(lando));
    lando.tasks.add('poweroff', require('./tasks/poweroff')(lando));
    lando.tasks.add('rebuild', require('./tasks/rebuild')(lando));
    lando.tasks.add('restart', require('./tasks/restart')(lando));
    lando.tasks.add('share', require('./tasks/share')(lando));
    lando.tasks.add('start', require('./tasks/start')(lando));
    lando.tasks.add('stop', require('./tasks/stop')(lando));

  });

  // Add github init method
  lando.events.on('post-bootstrap', function(lando) {
    lando.init.add('github', require('./github')(lando));
  });

  // Go through our init methods and log them
  lando.events.on('post-bootstrap', 9, function(lando) {

    // Load the init task here because its special
    lando.tasks.add('init', require('./tasks/init')(lando));

    // Log
    _.forEach(lando.init.get(), function(method) {
      lando.log.verbose('Init method %s loaded', method);
    });

  });

};
*/

/**
 * This adds basic app env parsing
 *
 * Specifically, it handles a "compose" option in the app config which is an
 * array of files. It is also responsible for parsing
 *
 * @name env
 */
/*
'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var dotenv = require('dotenv');
  var fs = lando.node.fs;
  var path = require('path');

  // Add in some high level config so our app can handle
  lando.events.on('post-instantiate-app', 1, function(app) {

    // Add a process env object, this is to inject ENV into the process
    // running the app task so we cna use $ENVARS in our docker compose
    // files
    app.processEnv = {};

    // Add a env object, these are envvars that get added to every container
    // Mix in containerGlobalEnv
    app.env = _.merge(lando.config.containerGlobalEnv, {});

    // Add a label object, these are labels that get added to every container
    app.labels = {};

    // Add in some common process envvars we might want
    app.processEnv.LANDO_APP_NAME = app.name;
    app.processEnv.LANDO_APP_ROOT = app.root;
    app.processEnv.LANDO_APP_ROOT_BIND = app.rootBind;

    // Add in some global container envvars
    app.env.LANDO = 'ON';
    app.env.LANDO_HOST_OS = lando.config.os.platform;
    app.env.LANDO_HOST_UID = lando.config.engineId;
    app.env.LANDO_HOST_GID = lando.config.engineGid;
    app.env.LANDO_HOST_IP = lando.config.env.LANDO_ENGINE_REMOTE_IP;
    app.env.LANDO_APP_ROOT = app.rootBind;
    app.env.LANDO_APP_NAME = app.name;
    app.env.LANDO_WEBROOT_USER = 'www-data';
    app.env.LANDO_WEBROOT_GROUP = 'www-data';
    app.env.LANDO_WEBROOT_UID = '33';
    app.env.LANDO_WEBROOT_GID = '33';
    var ppk = lando.config.loadPassphraseProtectedKeys;
    app.env.LANDO_LOAD_PP_KEYS = _.toString(ppk);
    app.env.COLUMNS = 256;

    // Inject values from an .env file if it exists
    // Look for a .env file and inject its vars into the service as well
    if (fs.existsSync(path.join(app.root, '.env'))) {

      // Log
      lando.log.debug('.env file found for %s, loading its config', app.name);

      // Load .env file
      var result = dotenv.config();

      // warn if needed
      if (result.error) {
        lando.log.warn('Trouble parsing .env file with %s', result.error);
      }

      // Merge in values to app.env
      if (!_.isEmpty(result.parsed)) {
        app.env = _.merge(app.env, result.parsed);
      }

    }

    // Add in some global labels
    var labels = app.labels || {};
    app.labels = _.merge(labels, {'io.lando.container': 'TRUE'});

    // Add the global env object to all our services
    app.events.on('app-ready', function() {

      // Log
      lando.log.verbose('App %s has global env.', app.name, app.env);
      lando.log.verbose('App %s has global labels.', app.name, app.labels);
      lando.log.verbose('App %s adds process env.', app.name, app.processEnv);

      // If we have some services lets add in our global envs and labels
      if (!_.isEmpty(app.services)) {
        _.forEach(app.services, function(service, name) {

          // Get existing ENV and LABELS
          var env = service.environment || {};
          var labels = service.labels || {};

          // Add our env globals
          _.forEach(app.env, function(value, key) {
            env[key] = value;
          });
          service.environment = env;

          // Add our global labels
          _.forEach(app.labels, function(value, key) {
            labels[key] = value;
          });
          service.labels = labels;

          // Reset the app conatiner
          app.services[name] = _.cloneDeep(service);

        });

      }

    });

  });

};
*/

/**
 * This adds info to an app and does some discovery on it
 *
 * Specifically, this will try to suss out relevant end user information such
 * as reachable urls, connection info, etc
 *
 * @name urls
 */
 /*

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;

  /*
   * Helper function to get URLs
   */
   /*

  var getUrls = function(app) {

    // Get list of containers
    return lando.engine.list(app.name)

    // Return running containers
    .filter(function(container) {
      return lando.engine.isRunning(container.id);
    })

    // Inspect each and add new URLS
    .map(function(container) {

      // Start a URL collector
      var urls = [];

      // Grab the service
      var service = container.service;

      // Inspect the container
      return lando.engine.inspect(container)

      // Grab our port data
      .then(function(data) {

        // Get our external ports
        var ports = data.NetworkSettings.Ports || [];

        // Loop through ports and add a URL if possible
        _.forEach(ports, function(externalPorts, port) {

          // Check to see if we have a port being forwarded and add it to the info
          if (_.has(app, 'config.services')) {
            if (_.get(app.config.services[service], 'portforward', false)) {
              var portPath = 'external_connection.port';
              if (!_.isEmpty(externalPorts)) {
                _.set(app.info[service], portPath, externalPorts[0].HostPort);
              }
            }
          }

          // If internal port is 80
          if (port === '80/tcp' || port === '443/tcp') {

            // Protocol
            var protocol = (port === '80/tcp') ? 'http://' : 'https://';

            // Add URL
            _.forEach(externalPorts, function(externalPort) {
              var url = protocol + 'localhost:' + externalPort.HostPort;
              lando.log.debug('Adding %s to %s on %s.', url, service, app.name);
              urls.push(protocol + 'localhost:' + externalPort.HostPort);
            });
          }

        });

      })

      // Add our URLs
      .then(function() {
        if (app.info[container.service] && !_.isEmpty(urls)) {
          lando.log.verbose('%s service %s has urls:', app.name, service, urls);
          app.info[container.service].urls = urls;
        }
      });

    });

  };

  // Add in some high level config so our app can handle
  lando.events.on('post-instantiate-app', 1, function(app) {

    // Add the services to the app
    app.events.on('app-ready', function() {

      // Add service keys
      _.forEach(_.keys(app.services), function(service) {
        app.info[service] = {};
      });

    });

    // Add the urls to the app
    app.events.on('pre-info', function() {
      return getUrls(app);
    });

    // The apps urls need to be refreshed on start since these can
    // change during the process eg on restart
    app.events.on('post-start', 1, function() {
      return getUrls(app);
    });

  });

};
*/
