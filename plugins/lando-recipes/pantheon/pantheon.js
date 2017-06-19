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
  var helpers = require('./../lamp/lamp')(lando);
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
  var env = function(framework) {

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
        'pantheon_binding': 'kalabox',
        'pantheon_site_uuid': 'uuid',
        'pantheon_environment': 'kalabox',
        'pantheon_tier': 'kalabox',
        'pantheon_index_host': 'solr',
        'pantheon_index_port': 449,
        'redis_client_host': 'redis',
        'redis_client_port': 8161,
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

    /*
    var env = {
      FRAMEWORK: framework,
      docroot: '/',
      filemount: frameworkSpec[framework].filemount,
      drupalHashSalt: settings.drupal_hash_salt,
      dbHost: 'database',
      dbPort: 3306,
      dbUser: 'pantheon',
      dbPassword: 'pantheon',
      dbName: 'pantheon',
      pantheonAccount: getConfig().email,
      pantheonBinding: 'kalabox',
      pantheonSite: getConfig().uuid,
      pantheonSiteName: app.name,
      pantheonEnvironment: 'kalabox',
      pressflowSettings: JSON.stringify(settings),
      cacheHost: settings.conf.redis_client_host,
      cachePort: settings.conf.redis_client_port,
      cachePassword: settings.conf.redis_client_password,
      pantheonIndexHost: settings.conf.pantheon_index_host,
      pantheonIndexPort: settings.conf.pantheon_index_port,
      backdropSettings: JSON.stringify(settings),
      authKey: drupalHashSalt,
      secureAuthKey: getHash(app.name),
      loggedInKey: getHash(app.domain),
      authSalt: getHash(app.domain + framework),
      secureAuthSalt: getHash(app.name + app.domain),
      loggedInSalt: getHash(app.name + app.name),
      nonceSalt: getHash(app.domain + app.domain)
    };
    */

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
      persist: true,
      portforward: true
    };

    // Return the redis service
    return lando.services.build('cache', 'redis:2.8', config);

  };

  /*
   * Add in varnish
   */
  var varnish = function() {

    // The redis config
    var config = {
      backends: ['nginx'],
      ssl: true,
      vcl: path.join(configDir, 'pantheon.vcl')
    };

    // Return the redis service
    return lando.services.build('edge', 'varnish:4.1', config);

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

    // Get the framework
    var framework = _.get(config, 'framework', 'drupal7');

    // Set our static high level config
    config.via = 'nginx:1.8';
    config.database = 'mariadb:10.0';

    // Mixin anything from pantheon.yml
    config = _.merge(config, pyaml(path.join(config._root, 'pantheon.yml')));

    // If the framework is drupal, then use drupal7
    if (framework === 'drupal') {
      framework = 'drupal7';
    }

    // Normalize because 7.0 gets handled strangely
    if (config.php === 7) {
      config.php = '7.0';
    }

    // Update with new config defaults if needed
    // @todo we need some sort of special config mixin here;
    // @todo: spin up pantheon config
    config = helpers.resetConfig(framework, config);

    // Start by cheating and mixing
    var build = lando.recipes.build(name, framework, config);

    // Set the pantheon environmental variables
    build.appserver.environment = env();

    // Mix in our additional services
    build = _.merge(build, redis());
    build = _.merge(build, varnish());
    // mixin solr

    // Reset the proxy
    build.proxy = proxy();

    // Add in the prepend.php

    // Add terminus download command

    // Add terminus tooling option

    console.log(config);
    console.log(JSON.stringify(build, null, 2));
    process.exit(1);

    // Return the things
    return build;

  };

  // Return the things
  return {
    build: build,
    configDir: __dirname
  };

};
