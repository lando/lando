/**
 * Pantheon recipe builder
 *
 * @name pantheon
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;
  var crypto = require('crypto');
  var fs = lando.node.fs;
  var path = require('path');
  var yaml = lando.node.yaml;

  // "Constants"
  var configDir = path.join(lando.config.engineConfigDir, 'pantheon');

  /*
   * Hash helper
   */
  var getHash = function(u) {
    return crypto.createHash('sha256').update(u).digest('hex');
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
        'pantheon_site_uuid': 'uuid',
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
      FRAMEWORK: config.framework,
      // @todo: does below need to consider nested docroot?
      DOCROOT: '/',
      FILEMOUNT: frameworkSpec[config.framework].filemount,
      DRUPAL_HASH_SALT: _.get(settings, 'drupal_hash_salt'),
      DB_HOST: 'database',
      DB_PORT: 3306,
      DB_USER: 'pantheon',
      DB_PASSWORD: 'pantheon',
      DB_NAME: 'pantheon',
      PANTHEON_SITE: '',
      PANTHEON_SITE_NAME: '',
      PANTHEON_ENVIRONMENT: 'lando',
      PRESSFLOW_SETTINGS: JSON.stringify(settings),
      CACHE_HOST: _.get(settings, 'conf.redis_client_host'),
      CACHE_PORT: _.get(settings, 'conf.redis_client_port'),
      CACHE_PASSWORD: _.get(settings, 'conf.redis_client_password'),
      PANTHEON_INDEX_HOST: _.get(settings, 'conf.pantheon_index_host'),
      PANTHEON_INDEX_PORT: _.get(settings, 'conf.pantheon_index_port'),
      BACKDROP_SETTINGS: JSON.stringify(settings),
      AUTH_KEY: drupalHashSalt,
      SECURE_AUTH_KEY: getHash(config._app),
      LOGGED_IN_KEY: getHash(config._app),
      AUTH_SALT: getHash(config._app + config.framework),
      SECURE_AUTH_SALT: getHash(config._app + config._root),
      LOGGED_IN_SALT: getHash(config._root + config._app),
      NONCE_SALT: getHash(config._root + config._root),
      NONCE_KEY: getHash(config._root + config.framework)
    };

    // Return the env
    return env;

  };

  /*
   * Helper to return proxy config
   */
  var proxy = function() {
    return {
      edge: [{port: '80/tcp', default: true}],
      'edge_ssl': [{port: '443/tcp', default: true, secure: true}]
    };
  };

  /*
   * Add in redis
   */
  var redis = function() {

    // The redis config
    var config = {
      type: 'redis:2.8',
      persist: true,
      portforward: true
    };

    // Return the redis service
    return config;

  };

  /*
   * Add in varnish
   */
  var varnish = function() {

    // The redis config
    var config = {
      type: 'varnish:4.1',
      backends: ['nginx'],
      ssl: true,
      vcl: path.join(configDir, 'pantheon.vcl')
    };

    // Return the redis service
    return config;

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
      var pconfig = yaml.safeLoad(fs.readFileSync(pyaml));

      // Set a php version
      config.php = _.get(pconfig, 'php_version', '5.6');
      config.webroot = (_.get(pconfig, 'web_docroot', false)) ? 'web' : '.';

    }

    // Return settings
    return config;

  };

  /*
   * Build out Pantheon
   */
  var build = function(name, config) {

    // @todo: spin up pantheon containers

    // Get the pantheon and lando base recipe framework
    var base = _.get(config, 'framework', 'drupal7');

    // Set our static high level config
    config.via = 'nginx:1.8';
    config.database = 'mariadb:10.0';

    // Mixin anything from pantheon.yml
    config = _.merge(config, pyaml(path.join(config._root, 'pantheon.yml')));

    // If the framework is drupal, then use drupal7
    if (base === 'drupal') {
      base = 'drupal7';
    }

    // Normalize because 7.0 gets handled strangely
    if (config.php === 7) {
      config.php = '7.0';
    }

    // Update with new config defaults
    config.conf = config.cong || {};
    config.conf.server = path.join(configDir, config.framework + '.conf');
    config.conf.php = path.join(configDir, 'php.ini');
    config.conf.database = path.join(configDir, 'mysql');

    // Start by cheating and mixing
    var build = lando.recipes.build(name, base, config);

    // Set the pantheon environmental variables
    var envPath = 'services.appserver.overrides.services.environment';
    _.set(build, envPath, env(config));

    // Mix in our additional services
    build.services.cache = redis();
    build.services.edge = varnish();
    // mixin solr
    // build.services.index = solr();

    // Reset the proxy
    build.proxy = proxy();

    // Add in the prepend.php

    // Add terminus download command

    // Add terminus tooling option

    // Return the things
    return build;

  };

  // Return the things
  return {
    build: build,
    configDir: __dirname
  };

};
