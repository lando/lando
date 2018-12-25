'use strict';

module.exports = lando => {
  // Load in our init method
  lando.init.add('pantheon', require('./init')(lando));

  // Modules
  const _ = lando.node._;
  const crypto = require('crypto');
  const fs = lando.node.fs;
  const path = require('path');

  // Lando things
  const PantheonApiClient = require('./client');
  const api = new PantheonApiClient(lando.log);
  const addConfig = lando.utils.services.addConfig;
  const buildVolume = lando.utils.services.buildVolume;

  // "Constants"
  const configDir = path.join(lando.config.servicesConfigDir, 'pantheon');

  /*
   * Hash helper
   */
  const getHash = u => crypto.createHash('sha256').update(u).digest('hex');

  /*
   * Event based logix
   */
  lando.events.on('post-instantiate-app', app => {
    // Cache key helpers
    const siteMetaDataKey = 'site.meta.';

    // Set new terminus key into the cache
    app.events.on('pre-terminus', () => {
      if (_.get(lando.cli.argv()._, '[1]') === 'auth:login') {
        if (_.has(lando.cli.argv(), 'machineToken')) {
          // Build the cache
          // @TODO: what do do about email?
          const token = _.get(lando.cli.argv(), 'machineToken');
          const data = {token: token};

          // Mix in any existing cache data
          if (!_.isEmpty(lando.cache.get(siteMetaDataKey + app.name))) {
            data = _.merge(lando.cache.get(siteMetaDataKey + app.name), data);
          }

          // Reset the cache
          lando.cache.set(siteMetaDataKey + app.name, data, {persist: true});
        }
      }
    });

    // Destroy the cached site data
    app.events.on('post-destroy', () => {
      lando.cache.remove(siteMetaDataKey + app.name);
    });
  });

  /*
   * Set constious pantheon environmental constiables
   */
  const env = config => {
    // Framework specific stuff
    const frameworkSpec = {
      drupal: {
        filemount: 'sites/default/files',
      },
      drupal8: {
        filemount: 'sites/default/files',
      },
      wordpress: {
        filemount: 'wp-content/uploads',
      },
      backdrop: {
        filemount: 'files',
      },
    };

    // Pressflow and backdrop database settings
    const pantheonDatabases = {
      default: {
        default: {
          driver: 'mysql',
          prefix: '',
          database: 'pantheon',
          username: 'pantheon',
          password: 'pantheon',
          host: 'database',
          port: 3306,
        },
      },
    };

    // Construct a hashsalt for Drupal 8
    const drupalHashSalt = getHash(JSON.stringify(pantheonDatabases));

    // Some Default settings
    const settings = {
      databases: pantheonDatabases,
      conf: {
        'pressflow_smart_start': true,
        'pantheon_binding': 'lando',
        'pantheon_site_uuid': _.get(config, 'id', 'lando'),
        'pantheon_environment': 'lando',
        'pantheon_tier': 'lando',
        'pantheon_index_host': 'index',
        'pantheon_index_port': 449,
        'redis_client_host': 'cache',
        'redis_client_port': 6379,
        'redis_client_password': '',
        'file_public_path': 'sites/default/files',
        'file_private_path': 'sites/default/files/private',
        'file_directory_path': 'sites/default/files',
        'file_temporary_path': '/tmp',
        'file_directory_temp': '/tmp',
        'css_gzip_compression': false,
        'js_gzip_compression': false,
        'page_compression': false,
      },
      drupal_hash_salt: drupalHashSalt,
      config_directory_name: 'config',
    };

    const env = {
      // Basics
      FRAMEWORK: config.framework,
      DOCROOT: '/',
      FILEMOUNT: frameworkSpec[config.framework].filemount,
      DRUPAL_HASH_SALT: _.get(settings, 'drupal_hash_salt'),
      PANTHEON_SITE: _.get(settings, 'conf.pantheon_site_uuid'),
      PANTHEON_SITE_NAME: _.get(config, 'site', config._app),
      PANTHEON_ENVIRONMENT: 'lando',

      // DB
      DB_HOST: 'database',
      DB_PORT: 3306,
      DB_USER: 'pantheon',
      DB_PASSWORD: 'pantheon',
      DB_NAME: 'pantheon',

      // Cache
      CACHE_HOST: _.get(settings, 'conf.redis_client_host'),
      CACHE_PORT: _.get(settings, 'conf.redis_client_port'),
      CACHE_PASSWORD: _.get(settings, 'conf.redis_client_password'),

      // Index
      PANTHEON_INDEX_HOST: _.get(settings, 'conf.pantheon_index_host'),
      PANTHEON_INDEX_PORT: _.get(settings, 'conf.pantheon_index_port'),

      // Framework
      BACKDROP_SETTINGS: JSON.stringify(settings),
      PRESSFLOW_SETTINGS: JSON.stringify(settings),
      AUTH_KEY: drupalHashSalt,
      SECURE_AUTH_KEY: getHash(config._app),
      LOGGED_IN_KEY: getHash(config._app),
      AUTH_SALT: getHash(config._app + config.framework),
      SECURE_AUTH_SALT: getHash(config._app + config._root),
      LOGGED_IN_SALT: getHash(config._root + config._app),
      NONCE_SALT: getHash(config._root + config._root),
      NONCE_KEY: getHash(config._root + config.framework),

      // Terminus
      // @todo: i am pretty sure these dont do anything yet
      TERMINUS_SITE: _.get(config, 'site', config._app),
      TERMINUS_ENV: _.get(config, 'env', 'dev'),
      // TERMINUS_ORG: ''
      // TERMINUS_USER="devuser@pantheon.io"
    };

    // Return the env
    return env;
  };

  /*
   * Helper to mix in the correct tooling
   */
  const tooling = config => {
    // Helper func to get envs
    const getEnvs = (done, nopes) => {
      // Envs to remove
      const restricted = nopes || [];

      // Get token
      const token = _.get(lando.cache.get('site.meta.' + config._app), 'token');

      // If token does not exist prmpt for auth
      if (_.isEmpty(token)) {
        lando.log.error('Looks like you dont have a machine token!');
        throw new Error('Run lando terminus auth:login --machine-token=TOKEN');
      }

      // Validate we have a token and siteid
      _.forEach([token, config.id], prop => {
        if (_.isEmpty(prop)) {
          lando.log.error('Error getting token or siteid.', prop);
          throw new Error('Make sure you run: lando init pantheon');
        }
      });

      // Get the pantheon sites using the token
      api.auth(token).then(authorizedApi => authorizedApi.getSiteEnvs(config.id))

      // Parse the evns into choices
      .map(env => ({name: env.id, value: env.id}))

      // Filter out any restricted envs
      .filter(env => !_.includes(restricted, env.value))

      // Done
      .then(envs => {
        envs.push({name: 'none', value: 'none'});
        done(null, envs);
      });
    };

    // Add in default pantheon tooling
    const tools = {
      'redis-cli': {
        service: 'cache',
      },
      'varnishadm': {
        service: 'edge',
        user: 'root',
      },
      'terminus': {
        service: 'appserver',
        needs: ['database'],
      },
    };

    // Add in the pull command
    tools.pull = {
      service: 'appserver',
      description: 'Pull code, database and/or files from Pantheon',
      needs: ['database'],
      cmd: '/helpers/pull.sh',
      options: {
        code: {
          description: 'The environment to get the code from or [none]',
          passthrough: true,
          alias: ['c'],
          interactive: {
            type: 'list',
            message: 'Pull code from?',
            choices: function() {
              getEnvs(this.async());
            },
            default: config.env || 'dev',
            weight: 600,
          },
        },
        database: {
          description: 'The environment to get the db from or [none]',
          passthrough: true,
          alias: ['d'],
          interactive: {
            type: 'list',
            message: 'Pull DB from?',
            choices: function() {
              getEnvs(this.async());
            },
            default: config.env || 'dev',
            weight: 601,
          },
        },
        files: {
          description: 'The environment to get the files from or [none]',
          passthrough: true,
          alias: ['f'],
          interactive: {
            type: 'list',
            message: 'Pull files from?',
            choices: function() {
              getEnvs(this.async());
            },
            default: config.env || 'dev',
            weight: 602,
          },
        },
        rsync: {
          description: 'Rsync the files, good for subsequent pulls',
          passthrough: true,
          boolean: true,
          default: false,
        },
      },
    };

    // Add in the push command
    tools.push = {
      service: 'appserver',
      description: 'Push code, database and/or files to Pantheon',
      cmd: '/helpers/push.sh',
      needs: ['database'],
      options: {
        code: {
          description: 'The environment to push the code to or [none]',
          default: 'dev',
          passthrough: true,
          alias: ['c'],
          interactive: {
            type: 'list',
            message: 'Push code to?',
            choices: function() {
              getEnvs(this.async(), ['test', 'live']);
            },
            default: 'dev',
            weight: 500,
          },
        },
        message: {
          description: 'A message describing your change',
          passthrough: true,
          alias: ['m'],
          interactive: {
            type: 'string',
            message: 'What did you change?',
            default: 'My awesome Lando-based changes',
            weight: 600,
            when: function(answers) {
              return answers.code !== 'none' && lando.cli.argv().code !== 'none';
            },
          },
        },
        database: {
          description: 'The environment to push the db to or [none]',
          passthrough: true,
          alias: ['d'],
          interactive: {
            type: 'list',
            message: 'Push db to?',
            choices: function() {
              getEnvs(this.async(), ['test', 'live']);
            },
            default: 'none',
            weight: 601,
          },
        },
        files: {
          description: 'The environment to push the files to or [none]',
          passthrough: true,
          alias: ['f'],
          interactive: {
            type: 'list',
            message: 'Push files to?',
            choices: function() {
              getEnvs(this.async(), ['test', 'live']);
            },
            default: 'none',
            weight: 602,
          },
        },
      },
    };

    // Add in the switch command
    tools['switch <env>'] = {
      service: 'appserver',
      description: 'Switch to a different multidev environment',
      needs: ['database'],
      cmd: '/helpers/switch.sh',
      options: {
        'no-db': {
          description: 'Do not switch the database',
          boolean: true,
          default: false,
        },
        'no-files': {
          description: 'Do not switch the files',
          boolean: true,
          default: false,
        },
      },
    };

    // Return the tools
    return tools;
  };

  /*
   * Helper to return proxy config
   */
  const proxy = name => {
    return {
      edge: [
        [name, lando.config.proxyDomain].join('.'),
      ],
    };
  };

  /*
   * Add in redis
   */
  const redis = version => {
    // The redis config
    const config = {
      type: version,
      persist: true,
      portforward: true,
    };

    // Return the redis service
    return config;
  };

  /*
   * Add in constnish
   */
  const varnish = version => {
    // The constnish config
    const config = {
      type: version,
      backends: ['nginx'],
      skipCheck: true,
      ssl: true,
      vcl: path.join(configDir, 'pantheon.vcl'),
    };
    // Return the constnish service
    return config;
  };

  /*
   * Add in solr
   */
  const solr = version => {
    // The solr config
    const config = {
      type: version,
      port: 449,
      overrides: {
        services: {
          image: 'devwithlando/pantheon-index:3.6-3',
          ports: ['449'],
          command: '/bin/bash /start.sh',
        },
      },
    };

    // Return the solr service
    return config;
  };

  /*
   * Mixin other needed pantheon volume based config like prepend.php
   */
  const pVols = volumes => {
    // The where and what to mount
    const mounts = [
      '/srv/includes:prepend.php',
      '/etc/nginx:nginx.conf',
      '/helpers:pantheon.sh',
      '/helpers:pull.sh',
      '/helpers:push.sh',
      '/helpers:switch.sh',
    ];

    // Loop
    _.forEach(mounts, mount => {
      // Break up the mount
      const container = mount.split(':')[0];
      const file = mount.split(':')[1];

      // Get the paths
      const local = path.join(configDir, file);
      const remote = [container, file].join('/');

      // Add the file
      volumes = addConfig(buildVolume(local, remote), volumes);
    });

    // Add a volume for terminus cache
    volumes.push('/var/www/.terminus');

    // Return the new volumes
    return volumes;
  };

  /*
   * Mixin settings from pantheon.ymls
   */
  const mergePyaml = configFile => {
    // Start with a config collector
    const config = {};

    // Check pantheon.yml settings if needed
    if (fs.existsSync(configFile)) {
      // Get the pantheon config
      const pconfig = lando.yaml.load(configFile);

      // Set a php version
      if (_.has(pconfig, 'php_version')) {
        config.php = _.get(pconfig, 'php_version');
      }

      // Set up a webroot
      if (_.has(pconfig, 'web_docroot')) {
        config.webroot = (_.get(pconfig, 'web_docroot', false)) ? 'web' : '.';
      }
    }

    // Return settings
    return config;
  };

  /*
   * Build out Pantheon
   */
  const build = (name, config) => {
    // Set versions to match pantheon
    config.cache = 'redis:2.8';
    config.edge = 'varnish:4.1';
    config.index = 'solr:custom';

    // Set the default php version based on framework
    config.php = phpVersion(config.framework);

    // Define our possible pantheon.ymls
    const pyamls = [
      path.join(config._root, 'pantheon.upstream.yml'),
      path.join(config._root, 'pantheon.yml'),
    ];

    // Mixin pyamls if applicable
    _.forEach(pyamls, pyaml => {
      config = _.merge(config, mergePyaml(pyaml, config));
    });

    // Normalize because 7.0 gets handled strangely by js-yaml
    if (config.php === 7) config.php = '7.0';

    // If this is Drupal8 let's add in drupal console and reset drush so it
    // globally installs Drush 8 FOR NOW
    // See: https://github.com/lando/lando/issues/580
    if (config.framework === 'drupal8') {
      config.drupal = true;
      config.drush = 'stable';
    }

    // Get the lando/pantheon base recipe/framework
    let base = _.get(config, 'framework', 'drupal7');

    // If the pantheon framework is drupal, then use lando d7 recipe
    if (base === 'drupal') base = 'drupal7';

    // Delegate and use a recipe
    const build = lando.recipes.build(name, base, config);

    // Set the pantheon environment
    const envPath = 'services.appserver.overrides.services.environment';
    _.set(build, envPath, env(config));

    // Mount additonal helpers like prepend.php
    const volPath = 'services.appserver.overrides.services.volumes';
    const vols = _.get(build, volPath, []);
    _.set(build, volPath, pVols(vols));

    // Overide our default php images with special pantheon ones
    const imagePath = 'services.appserver.overrides.services.image';
    const image = 'devwithlando/pantheon-appserver:' + config.php;
    _.set(build, imagePath, image);

    // Set the appserver to depend on index start up so we know our certs will be there
    const dependsPath = 'services.appserver.overrides.services.depends_on';
    _.set(build, dependsPath, ['index']);

    // Add in our pantheon script
    // NOTE: We do this here instead of in /scripts because we need to gaurantee
    // it runs before the other build steps so it can reset our CA correctly
    build.services.appserver.install_dependencies_as_root_internal = ['/helpers/pantheon.sh'];

    // Mix in our additional services
    build.services.cache = redis(config.cache);
    build.services.edge = varnish(config.edge);
    build.services.index = solr(config.index);

    // Reset the proxy to route through the edge
    build.proxy = proxy(name);

    // Mix in our tooling
    build.tooling = _.merge(build.tooling, tooling(config));

    // Determine the service to run cli things on
    const unsupportedCli = (config.php === '5.3' || config.php === 5.3);
    const cliService = (unsupportedCli) ? 'appserver_cli' : 'appserver';

    // Build an additional cli container if we are running unsupported
    if (unsupportedCli) {
      // Build out a CLI container and modify as appropriate
      const cliImage = 'devwithlando/pantheon-appserver:5.5-fpm';
      build.services[cliService] = _.cloneDeep(build.services.appserver);
      build.services[cliService].type = 'php:5.5';
      build.services[cliService].via = 'cli';
      build.services[cliService].overrides.services.image = cliImage;

      // Remove stuff from appserver
      delete build.services.appserver.install_dependencies_as_me_internal;

      // Override some tooling things
      build.tooling.terminus.service = cliService;
      build.tooling.pull.service = cliService;
      build.tooling.push.service = cliService;
    }

    // Login with terminus if we have a token
    const cache = lando.cache.get('site.meta.' + config._app);
    if (_.has(cache, 'token')) {
      const token = _.get(cache, 'token');
      const terminusLogin = 'terminus auth:login --machine-token=' + token;
      build.services[cliService].install_dependencies_as_me_internal.push(terminusLogin);
    }

    // Return the things
    return build;
  };

  // Return the things
  return {
    build: build,
    configDir: __dirname,
    webroot: false,
    name: false,
  };
};
