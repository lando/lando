/**
 * Pantheon recipe builder
 *
 * @name pantheon
 */

'use strict';

module.exports = function(lando) {

  // Load in our init method
  lando.init.add('pantheon', require('./init')(lando));

  // Modules
  var _ = lando.node._;
  var crypto = require('crypto');
  var fs = lando.node.fs;
  var path = require('path');

  // Lando things
  var api = require('./client')(lando);
  var addConfig = lando.services.addConfig;
  var buildVolume = lando.services.buildVolume;

  // "Constants"
  var configDir = path.join(lando.config.engineConfigDir, 'pantheon');

  /*
   * Hash helper
   */
  var getHash = function(u) {
    return crypto.createHash('sha256').update(u).digest('hex');
  };

  /*
   * Helper to reset terminus auth
   */
  lando.events.on('post-instantiate-app', function(app) {
    app.events.on('pre-terminus', function() {
      if (_.get(lando.tasks.argv()._, '[1]') === 'auth:login') {
        if (_.has(lando.tasks.argv(), 'machineToken')) {

          // Cache key helpers
          var siteMetaDataKey = 'site:meta:';

          // Build the cache
          // @TODO: what do do about email?
          var token = _.get(lando.tasks.argv(), 'machineToken');
          var data = {token: token};

          // Reset the cache
          lando.cache.set(siteMetaDataKey + app.name, data, {persist: true});

        }
      }
    });
  });

  /*
   * Set various pantheon environmental variables
   */
  var env = function(config) {

    // Framework specific stuff
    var frameworkSpec = {
      drupal: {
        filemount: 'sites/default/files'
      },
      drupal8: {
        filemount: 'sites/default/files'
      },
      wordpress: {
        filemount: 'wp-content/uploads'
      },
      backdrop: {
        filemount: 'files'
      }
    };

    // Pressflow and backdrop database settings
    var pantheonDatabases = {
      default: {
        default: {
          driver: 'mysql',
          prefix: '',
          database: 'pantheon',
          username: 'pantheon',
          password: 'pantheon',
          host: 'database',
          port: 3306
        }
      }
    };

    // Construct a hashsalt for Drupal 8
    var drupalHashSalt = getHash(JSON.stringify(pantheonDatabases));

    // Some Default settings
    var settings = {
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
        'page_compression': false
      },
      'drupal_hash_salt': drupalHashSalt,
      'config_directory_name': 'config'
    };

    var env = {

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
      TERMINUS_SITE: _.get(config, 'site', config._app),
      TERMINUS_ENV: _.get(config, 'env', 'dev')
      //TERMINUS_ORG: ''
      //TERMINUS_USER="devuser@pantheon.io"

    };

    // Return the env
    return env;

  };

  /*
   * Helper to mix in the correct tooling
   */
  var tooling = function(config) {

    // Helper func to get envs
    var getEnvs = function(done, nopes) {

      // Envs to remove
      var restricted = nopes || [];

      // Get token
      var token = _.get(lando.cache.get('site:meta:' + config._app), 'token');

      // If token does not exist prmpt for auth
      if (_.isEmpty(token)) {
        lando.log.error('Looks like you dont have a machine token!');
        lando.log.error('Run lando terminus auth:login --machine-token=TOKEN');
        process.exit(1);
      }

      // Validate we have a token and siteid
      _.forEach([token, config.id], function(prop) {
        if (_.isEmpty(prop)) {
          lando.log.error('Error getting token or siteid.', prop);
          lando.log.error('Make sure you run:');
          lando.log.error('lando init %s pantheon', config._app);
          process.exit(1);
        }
      });

      // Get the pantheon sites using the token
      api.getEnvs(token, config.id)

      // Parse the evns into choices
      .map(function(env) {
        return {name: env.id, value: env.id};
      })

      // Filter out any restricted envs
      .filter(function(env) {
        return (!_.includes(restricted, env.value));
      })

      // Done
      .then(function(envs) {
        envs.push({name: 'none', value: 'none'});
        done(null, envs);
      });

    };

    // Add in default pantheon tooling
    var tools = {
      'redis-cli': {
        service: 'cache'
      },
      varnishadm: {
        service: 'edge',
        user: 'root'
      }
    };

    // Add in terminus if this is not php 5.3
    if (config.php !== '5.3') {
      tools.terminus = {
        service: 'appserver'
      };
    }

    // Add in the pull command
    tools.pull = {
      service: 'appserver',
      description: 'Pull code, database and/or files from Pantheon',
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
            weight: 600
          }
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
            weight: 601
          }
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
            weight: 602
          }
        },
        rsync: {
          description: 'Rsync the files, good for subsequent pulls',
          boolean: true,
          default: false
        }
      }
    };

    // Add in the push command
    tools.push = {
      service: 'appserver',
      description: 'Push code, database and/or files to Pantheon',
      cmd: '/helpers/push.sh',
      options: {
        message: {
          description: 'A message describing your change',
          passthrough: true,
          alias: ['m'],
          interactive: {
            type: 'string',
            message: 'What did you change?',
            default: 'My awesome Lando-based changes',
            weight: 600
          }
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
            default: config.env || 'dev',
            weight: 601
          }
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
            default: config.env || 'dev',
            weight: 602
          }
        }
      }
    };

    // Add in the switch command
    tools['switch <env>'] = {
      service: 'appserver',
      description: 'Switch to a different multidev environment',
      cmd: '/helpers/switch.sh',
      options: {
        'no-db': {
          description: 'Do not switch the database',
          boolean: true,
          default: false
        },
        'no-files': {
          description: 'Do not switch the files',
          boolean: true,
          default: false
        }
      }
    };

    // Return the tools
    return tools;

  };

  /*
   * Helper to return proxy config
   */
  var proxy = function(name) {
    return {
      edge: [
        [name, lando.config.proxyDomain].join('.')
      ]
    };
  };

  /*
   * Add in redis
   */
  var redis = function(version) {

    // The redis config
    var config = {
      type: version,
      persist: true,
      portforward: true
    };

    // Return the redis service
    return config;

  };

  /*
   * Add in varnish
   */
  var varnish = function(version) {

    // The varnish config
    var config = {
      type: version,
      backends: ['nginx'],
      ssl: true,
      vcl: path.join(configDir, 'pantheon.vcl')
    };

    // Return the varnish service
    return config;

  };

  /*
   * Add in solr
   */
  var solr = function(version) {

    // The solr config
    var config = {
      type: version,
      port: 449,
      overrides: {
        services: {
          image: 'kalabox/pantheon-index:3.6',
          ports: ['449'],
          command: '/bin/bash /start.sh'
        }
      }
    };

    // Return the solr service
    return config;

  };

  /*
   * Mixin other needed pantheon volume based config like prepend.php
   */
  var pVols = function(volumes) {

    // The where and what to mount
    var mounts = [
      '/srv/includes:prepend.php',
      '/etc/nginx:nginx.conf',
      '/helpers:pantheon.sh',
      '/helpers:pull.sh',
      '/helpers:push.sh',
      '/helpers:switch.sh'
    ];

    // Loop
    _.forEach(mounts, function(mount) {

      // BReak up the mount
      var container = mount.split(':')[0];
      var file = mount.split(':')[1];

      // Get the paths
      var local = path.join(configDir, file);
      var remote = [container, file].join('/');

      // Add the file
      volumes = addConfig(buildVolume(local, remote), volumes);

    });

    // Add a volume for terminus and drupal console cache
    volumes.push('/var/www/.terminus');
    volumes.push('/var/www/.drupal');

    // Return the new volumes
    return volumes;

  };

  /*
   * Mixin settings from pantheon.yml
   */
  var pyaml = function(pyaml) {

    // Collect more setting
    var config = {};

    // Check pantheon.yml settings if needed
    if (fs.existsSync(pyaml)) {

      // Get the pantheon config
      var pconfig = lando.yaml.load(pyaml);

      // Set a php version
      config.php = _.get(pconfig, 'php_version');
      config.webroot = (_.get(pconfig, 'web_docroot', false)) ? 'web' : '.';

    }

    // Return settings
    return config;

  };

  /*
   * Helper to set default php version based on framework
   */
  var phpVersion = function(framework) {
    switch (framework) {
      case 'backdrop': return '5.6';
      case 'drupal': return '5.6';
      case 'drupal8': return '7.0';
      case 'wordpress': return '7.0';
      default: return '5.6';
    }
  };

  /*
   * Helper for build steps
   */
  var buildSteps = function(config) {

    // But add some extra steps if we are on backdrop
    // Need to cp backdrush command files into ~/.drush
    if (config.framework === 'backdrop') {
      return [
        'mkdir -p /var/www/.drush/backdrush',
        'cp -rf /var/www/.backdrush/* /var/www/.drush/backdrush/',
        'drush cc drush'
      ];
    }

    // Make sure we clean up if we switch to something else
    else {
      return [
        'rm -rf /var/www/.drush/backdrush/',
        'drush cc drush'
      ];
    }

  };

  /*
   * Build out Pantheon
   */
  var build = function(name, config) {

    // Set versions to match pantheon
    config.via = 'nginx:1.8';
    config.database = 'mariadb:10.0';
    config.cache = 'redis:2.8';
    config.edge = 'varnish:4.1';
    config.index = 'solr:custom';
    config.framework = _.get(config, 'framework', 'drupal');

    // Update with new config defaults
    config.conf = config.cong || {};
    config.conf.server = path.join(configDir, config.framework + '.conf');
    config.conf.php = path.join(configDir, 'php.ini');
    config.conf.database = path.join(configDir, 'mysql');

    // Set the default php version based on framework
    config.php = phpVersion(config.framework);

    // Mixin anything from pantheon.yml if it exists
    config = _.merge(config, pyaml(path.join(config._root, 'pantheon.yml')));

    // Normalize because 7.0 gets handled strangely by js-yaml
    if (config.php === 7) { config.php = '7.0'; }

    // If this is Drupal8 let's add in drupal console as well
    if (config.framework === 'drupal8') { config.drupal = true; }

    // Get the lando/pantheon base recipe/framework
    var base = _.get(config, 'framework', 'drupal7');

    // If the pantheon framework is drupal, then use lando d7 recipe
    if (base === 'drupal') { base = 'drupal7'; }

    // Delegate and use a recipe
    var build = lando.recipes.build(name, base, config);

    // Set the pantheon environment
    var envPath = 'services.appserver.overrides.services.environment';
    _.set(build, envPath, env(config));

    // Mount additonal helpers like prepend.php
    var volPath = 'services.appserver.overrides.services.volumes';
    var vols = _.get(build, volPath, []);
    _.set(build, volPath, pVols(vols));

    // Overide our default php images with special pantheon ones
    var imagePath = 'services.appserver.overrides.services.image';
    var image = 'kalabox/pantheon-php:' + config.php + '-fpm';
    _.set(build, imagePath, image);

    // Set the appserver to depend on index start up so we know our certs will be there
    var dependsPath = 'services.appserver.overrides.services.depends_on';
    _.set(build, dependsPath, ['index']);

    // Add in our pantheon script
    // NOTE: We do this here instead of in /scripts because we need to gaurantee
    // it runs before the other build steps so it can reset our CA correctly
    build.services.appserver.extras = ['/helpers/pantheon.sh'];

    // Reset our build steps
    build.services.appserver.build = buildSteps(config);

    // Mix in our additional services
    build.services.cache = redis(config.cache);
    build.services.edge = varnish(config.edge);
    build.services.index = solr(config.index);

    // Reset the proxy to route through the edge
    build.proxy = proxy(name);

    // Mix in our tooling
    build.tooling = _.merge(build.tooling, tooling(config));

    // Run composer install if we have the file
    if (fs.existsSync((path.join(config._root, 'composer.json')))) {
      var composerInstall = 'cd $LANDO_MOUNT && composer install';
      build.services.appserver.build.push(composerInstall);
    }

    // Login with terminus if we have a token
    var cache = lando.cache.get('site:meta:' + config._app);
    if (_.has(cache, 'token')) {
      var token = _.get(cache, 'token');
      var terminusLogin = 'terminus auth:login --machine-token=' + token;
      build.services.appserver.build.push(terminusLogin);
    }

    // Return the things
    return build;

  };

  // Return the things
  return {
    build: build,
    configDir: __dirname,
    webroot: false
  };

};
