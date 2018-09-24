'use strict';

module.exports = lando => {
  // Modules
  const _ = lando.node._;
  const dotenv = require('dotenv');
  const fs = lando.node.fs;
  const merger = lando.utils.config.merge;
  const path = require('path');
  const utils = require('./lib/utils');

  // Add some config for the engine
  lando.events.on('post-bootstrap', 1, lando => {
    // Log
    lando.log.info('Configuring app plugin');

    // Build the default config object
    const defaultAppConfig = {
      appConfigFilename: '.lando.yml',
      appsRoot: path.join(lando.config.home, 'Lando'),
      appRegistry: 'registry',
    };

    // Merge defaults over the config, this allows users to set their own things
    lando.config = lando.utils.config.merge(defaultAppConfig, lando.config);

    // Log it
    lando.log.verbose('App plugin configured with %j', lando.config);

    // Add utilities
    lando.utils.app = require('./lib/utils');
  });

  // Add some config for the engine
  lando.events.on('post-bootstrap', 2, lando => {
    // Log
    lando.log.info('Initializing app plugin');
    // Add the app module
    lando.app = require('./app')(lando);
  });

  // Add in our app tasks
  lando.events.on('post-bootstrap', lando => {
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

  // Merge compose files specified in landofile to services/networks/volumes
  lando.events.on('post-instantiate-app', 1, app => {
    // Define helpful global enconsts
    const env = {
      LANDO: 'ON',
      LANDO_CA_CERT: '/lando/certs/' + path.basename(lando.config.caCert),
      LANDO_CA_KEY: '/lando/certs/' + path.basename(lando.config.caKey),
      LANDO_CONFIG_DIR: '$LANDO_ENGINE_CONF',
      LANDO_DOMAIN: lando.config.proxyDomain,
      LANDO_APP_NAME: app.name,
      LANDO_APP_ROOT: app.root,
      LANDO_APP_ROOT_BIND: app.root,
      LANDO_HOST_OS: lando.config.os.platform,
      LANDO_HOST_UID: lando.config.engineId,
      LANDO_HOST_GID: lando.config.engineGid,
      LANDO_HOST_IP: lando.config.env.LANDO_ENGINE_REMOTE_IP,
      LANDO_WEBROOT_USER: 'www-data',
      LANDO_WEBROOT_GROUP: 'www-data',
      LANDO_WEBROOT_UID: '33',
      LANDO_WEBROOT_GID: '33',
    };

    // Define helpful global labels
    const labels = {
      'io.lando.container': 'TRUE',
      'io.lando.id': lando.config.instance,
    };

    // Add things just meant for the container env
    app.env.COLUMNS = 256;

    // Add env to both the process and container environment
    _.forEach(env, (value, key) => {
      lando.config.env[key] = value;
      app.env[key] = value;
    });

    // Mix in labels
    app.labels = merger(app.labels, labels);

    // Inject values from an .env file if it exists
    if (fs.existsSync(path.join(app.root, '.env'))) {
      // Log
      lando.log.debug('.env file found for %s, loading its config', app.name);

      // Load .env file
      const result = dotenv.config();

      // warn if needed
      if (result.error) {
        lando.log.warn('Trouble parsing .env file with %s', result.error);
      }

      // Merge in values to app.env
      if (!_.isEmpty(result.parsed)) {
        app.env = merger(app.env, result.parsed);
      }
    }

    // Check to see if we have config.compose and merge
    if (_.has(app, 'config.compose')) {
      // Get the app root
      const root = app.root;

      // Validate files
      const files = utils.validateFiles(_.get(app, 'config.compose', [], root));

      // And merge them in
      _.forEach(files, file => {
        // Get our object from file
        const data = lando.yaml.load(file);

        // Merge things in
        app.services = merger(app.services, data.services);
        app.volumes = merger(app.volumes, data.volumes);
        app.networks = merger(app.networks, data.networks);

        // Log
        lando.log.verbose('Added compose file %s to app.', file);
      });
    }
  });

  // Do things all the way at the end
  lando.events.on('post-instantiate-app', 9, app => {
    // Add in some globals
    app.events.on('app-ready', 8, () => {
      // Add in some globas
      _.forEach(app.services, (service, name) => {
        // Get existing ENV and LABELS
        const env = service.environment || {};
        const labels = service.labels || {};

        // Merge in globals
        service.environment = merger(env, app.env);
        service.labels = merger(labels, app.labels);

        // Log
        lando.log.verbose('Service %s has env %j', name, service.environment);
        lando.log.verbose('Service %s has labels %j', name, service.labels);
      });

      // Add a copy of the app to opts for passthru considerations
      app.opts = {app: _.cloneDeep(app)};
    });

    // Parse whatever docker thigns we might have into docker compose files
    app.events.on('app-ready', 9, () => {
      // Get our things
      const networks = app.networks || {};
      const project = app.project || app.name;
      const projectDir = path.join(lando.config.userConfRoot, 'compose', project);
      const services = app.services || {};
      const version = app.version;
      const volumes = app.volumes || {};

      // Get the compose object
      const compose = utils.compose(version, services, volumes, networks);

      // Write the services
      const fileName = [project, _.uniqueId()].join('-') + '.yml';
      const file = lando.yaml.dump(path.join(projectDir, fileName), compose);

      // Add that file to our compose list
      app.compose.push(file);

      // Log
      lando.log.verbose('App %s has compose files.', project, file);
    });

    // Also gather info on a start
    app.events.on('post-start', 1, () => {
      return lando.app.info(app);
    });

    // Scan our URLs and add a list of them and their status to the app
    app.events.on('post-start', 9, () => {
      // Get app URLs
      const urls = _.filter(_.flatMap(app.info, 'urls'), _.identity);

      // Scan the urls
      return lando.scanUrls(urls, {max: 17})

      // Add our URLS to the app
      .then(urls => {
        app.urls = urls;
      });
    });
  });
};
