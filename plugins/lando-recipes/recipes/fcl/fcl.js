'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var api = require('./client')(lando);
  var fs = lando.node.fs;
  var path = require('path');
  //var Promise = lando.Promise;
  //var url = require('url');
  var crypto = require('crypto');
  var ncp = require('ncp').ncp;

  //link()
  /*
  const cachePath = path.join(path.dirname(process.cwd()), 'composer-cache');
  console.log('Base path : ', cachePath);
  if (fs.existsSync(cachePath)) {

    ncp(cachePath, '.composer-cache', function (err) {
      if (err) {
        return console.error(err);
      }
      console.log('done!');
     });

  }
*/

  // List of additional options
  var options = {

  };

    // Lando things
    var api = require('./client')(lando);
    var addConfig = lando.utils.services.addConfig;
    var buildVolume = lando.utils.services.buildVolume;

    // "Constants"
    var configDir = path.join(lando.config.servicesConfigDir, 'pantheon');


  /*
   * Mixin other needed pantheon volume based config like prepend.php
   */
  var pVols = function(volumes) {


    const cachePath = path.join(path.dirname(process.cwd()), 'composer-cache');

    // The where and what to mount
    var mounts = [
      '/srv/includes:prepend.php',
      '/etc/nginx:nginx.conf',
      '/helpers:pantheon.sh',
      '/helpers:pull.sh',
      '/helpers:push.sh',
      '/helpers:switch.sh',
      '/app/.composer-cache:' + cachePath
    ];

    // Loop
    _.forEach(mounts, function(mount) {

      // Break up the mount
      var container = mount.split(':')[0];
      var file = mount.split(':')[1];

      // Get the paths
      var local = path.join(configDir, file);
      var remote = [container, file].join('/');

      // Add the file
      volumes = addConfig(buildVolume(local, remote), volumes);
    });

    // Add a volume for terminus cache
    volumes.push('/var/www/.terminus');

    // Return the new volumes
    return volumes;

  };

  /*
   * Hash helper
   */
  var getHash = function(u) {
    return crypto.createHash('sha256').update(u).digest('hex');
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
      var token = _.get(lando.cache.get('site.meta.' + config._app), 'token');

      // If token does not exist prmpt for auth
      if (_.isEmpty(token)) {
        lando.log.error('Looks like you dont have a machine token!');
        throw new Error('Run lando terminus auth:login --machine-token=TOKEN');
      }

      // Validate we have a token and siteid
      _.forEach([token, config.id], function(prop) {
        if (_.isEmpty(prop)) {
          lando.log.error('Error getting token or siteid.', prop);
          throw new Error('Make sure you run: lando init pantheon');
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
      },
      terminus: {
        service: 'appserver',
        needs: ['database']
      }
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
      needs: ['database'],
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
            default: 'none',
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
            default: 'none',
            weight: 602
          }
        }
      }
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

  /*
   * Helper to return proxy config
   */
  var proxy = function(name) {
    return {
      edge: [
        ['fcl-appserver-' + name, lando.config.proxyDomain].join('.')
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
          image: 'devwithlando/pantheon-index:3.6-2',
          ports: ['449'],
          command: '/bin/bash /start.sh'
        }
      }
    };

    // Return the solr service
    return config;

  };


  /*
   * Mixin settings from pantheon.ymls
   */
  var mergePyaml = function(configFile) {

    // Start with a config collector
    var config = {};

    // Check pantheon.yml settings if needed
    if (fs.existsSync(configFile)) {

      // Get the pantheon config
      var pconfig = lando.yaml.load(configFile);

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

      COMPOSER_CACHE_DIR: '/app/.composer-cache',
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
      TERMINUS_ENV: _.get(config, 'env', 'dev')
      //TERMINUS_ORG: ''
      //TERMINUS_USER="devuser@pantheon.io"

    };

    // Return the env
    return env;

  };


  /*
   * Helper to mix in other pantheon options
   */
  var yaml = function(config, options) {

    // Let's get our sites
    return api.getSites(_.get(options, 'pantheon-auth'))

    // Filter out our site
    .filter(function(site) {
      return site.name === _.get(options, 'pantheon-site');
    })

    // Set the config
    .then(function(site) {

      // Augment the config
      config.config = {};
      config.config.framework = _.get(site[0], 'framework', 'drupal');
      config.config.site = _.get(site[0], 'name', config.name);
      config.config.id = _.get(site[0], 'id', 'lando');

      // Set some cached things as well
      var token = _.get(options, 'pantheon-auth');
      var tokens = lando.cache.get(tokenCacheKey);
      var email = '';

      // Check to see if our "token" is actually an email
      if (_.includes(_.keys(tokens), token)) {
        email = token;
        token = tokens[email];
      }

      // If not, do it nasty
      else {
        email = _.findKey(tokens, function(value) {
          return value === token;
        });
      }

      // Set and cache the TOKENZZZZ
      var data = {email: email, token: token};
      var name = lando.utils.engine.dockerComposify(options.appname);
      lando.cache.set(siteMetaDataKey + name, data, {persist: true});

      // Return it
      return config;

    });

  };


  /*
   * Build out pantheon recipe
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
    config.php = '7.2';

    // Define our possible pantheon.ymls
    var pyamls = [
      path.join(config._root, 'pantheon.upstream.yml'),
      path.join(config._root, 'pantheon.yml')
    ];

    // Mixin pyamls if applicable
    _.forEach(pyamls, function(pyaml) {
      config = _.merge(config, mergePyaml(pyaml, config));
    });

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
    //const _env = env(config);
    //console.log('set env : ', _env);

    _.set(build, envPath, env(config));

    // Mount additonal helpers like prepend.php
    var volPath = 'services.appserver.overrides.services.volumes';
    var vols = _.get(build, volPath, []);
    _.set(build, volPath, pVols(vols));

    // Overide our default php images with special pantheon ones
    var imagePath = 'services.appserver.overrides.services.image';
    var image = 'devwithlando/pantheon-appserver:' + config.php;
    _.set(build, imagePath, image);

    // Set the appserver to depend on index start up so we know our certs will be there
    var dependsPath = 'services.appserver.overrides.services.depends_on';
    _.set(build, dependsPath, ['index']);

    // Add in our pantheon script
    // NOTE: We do this here instead of in /scripts because we need to gaurantee
    // it runs before the other build steps so it can reset our CA correctly
    build.services.appserver.run_as_root_internal = ['/helpers/pantheon.sh'];

    // Mix in our additional services
    build.services.cache = redis(config.cache);
    build.services.edge = varnish(config.edge);
    build.services.index = solr(config.index);

    // Reset the proxy to route through the edge
    build.proxy = proxy(name);

    // Mix in our tooling
    build.tooling = _.merge(build.tooling, tooling(config));

    // Determine the service to run cli things on
    var unsupportedCli = (config.php === '5.3' || config.php === 5.3);
    var cliService = (unsupportedCli) ? 'appserver_cli' : 'appserver';

    // Build an additional cli container if we are running unsupported
    if (unsupportedCli) {

      // Build out a CLI container and modify as appropriate
      var cliImage = 'devwithlando/pantheon-appserver:5.5-fpm';
      build.services[cliService] = _.cloneDeep(build.services.appserver);
      build.services[cliService].type = 'php:5.5';
      build.services[cliService].via = 'cli';
      build.services[cliService].overrides.services.image = cliImage;

      // Remove stuff from appserver
      delete build.services.appserver.run_internal;

      // Override some tooling things
      build.tooling.terminus.service = cliService;
      build.tooling.pull.service = cliService;
      build.tooling.push.service = cliService;

    }

    // Login with terminus if we have a token
    var cache = lando.cache.get('site.meta.' + config._app);
    if (_.has(cache, 'token')) {
      var token = _.get(cache, 'token');
      var terminusLogin = 'terminus auth:login --machine-token=' + token;
      build.services[cliService].run_internal.push(terminusLogin);
    }

    // Return the things
    return build;

  };


  // Return the things
  return {
    build: build,
    options: options,
    yaml: yaml
  };

};
