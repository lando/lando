'use strict';

// Modules
const _ = require('lodash');
const crypto = require('crypto');
const fs = require('fs');
const yaml = require('js-yaml');

// Constants
const PANTHEON_CACHE_HOST = 'cache';
const PANTHEON_CACHE_PORT = '6379';
const PANTHEON_CACHE_PASSWORD = '';
const PANTHEON_INDEX_HOST = 'index';
const PANTHEON_INDEX_PORT = '449';
const PATH = [
  '/app/vendor/bin',
  '/usr/local/sbin',
  '/usr/local/bin',
  '/usr/sbin',
  '/usr/bin',
  '/sbin',
  '/bin',
  '/var/www/.composer/vendor/bin',
  '/srv/bin',
];

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

/*
 * Helper to get filemount by framework
 */
const getFilemount = framework => {
  switch (framework) {
    case 'backdrop': return 'files';
    case 'drupal': return 'sites/default/files';
    case 'drupal8': return 'sites/default/files';
    case 'wordpress': return 'wp-content/uploads';
    default: return 'sites/default/files';
  }
};

/*
 * Hash helper
 */
const getHash = u => crypto.createHash('sha256').update(u).digest('hex');

/*
 * Helper to get pantheon settings
 */
const getPantheonSettings = options => ({
  databases: pantheonDatabases,
  conf: {
    'pressflow_smart_start': true,
    'pantheon_binding': 'lando',
    'pantheon_site_uuid': options.id,
    'pantheon_environment': 'lando',
    'pantheon_tier': 'lando',
    'pantheon_index_host': PANTHEON_INDEX_HOST,
    'pantheon_index_port': PANTHEON_INDEX_PORT,
    'redis_client_host': PANTHEON_CACHE_HOST,
    'redis_client_port': PANTHEON_CACHE_PORT,
    'redis_client_password': PANTHEON_CACHE_PASSWORD,
    'file_public_path': 'sites/default/files',
    'file_private_path': 'sites/default/files/private',
    'file_directory_path': 'sites/default/files',
    'file_temporary_path': '/tmp',
    'file_directory_temp': '/tmp',
    'css_gzip_compression': false,
    'js_gzip_compression': false,
    'page_compression': false,
  },
  drupal_hash_salt: getHash(JSON.stringify(pantheonDatabases)),
  config_directory_name: 'config',
});

/*
 * Helper to merge in pantheon yamls
 */
exports.getPantheonConfig = (files = ['pantheon.upstream.yml', 'pantheon.yml']) => _(files)
  .filter(file => fs.existsSync(file))
  .map(file => yaml.safeLoad(fs.readFileSync(file)))
  .thru(data => _.merge({}, ...data))
  .thru(data => {
    // Set the php version
    // @TODO: what is the best version here?
    data.php = _.toString(_.get(data, 'php_version', '5.6'));
    // Set the webroot
    data.webroot = (_.get(data, 'web_docroot', false)) ? 'web' : '.';
    // return
    return data;
  })
  .value();

/*
 * Helper to get pantheon envvars
 */
exports.getPantheonEnvironment = options => ({
  AUTH_KEY: getHash(JSON.stringify(pantheonDatabases)),
  AUTH_SALT: getHash(options.app + options.framework),
  BACKDROP_SETTINGS: JSON.stringify(getPantheonSettings(options)),
  CACHE_HOST: PANTHEON_CACHE_HOST,
  CACHE_PORT: PANTHEON_CACHE_HOST,
  CACHE_PASSWORD: PANTHEON_CACHE_PASSWORD,
  DB_HOST: 'database',
  DB_PORT: 3306,
  DB_USER: 'pantheon',
  DB_PASSWORD: 'pantheon',
  DB_NAME: 'pantheon',
  DOCROOT: '/',
  DRUPAL_HASH_SALT: getHash(JSON.stringify(pantheonDatabases)),
  drush_version: options.drush_version,
  FRAMEWORK: options.framework,
  FILEMOUNT: getFilemount(options.framework),
  LOGGED_IN_KEY: getHash(options.app),
  LOGGED_IN_SALT: getHash(options.root + options.app),
  NONCE_SALT: getHash(options.root + options.root),
  NONCE_KEY: getHash(options.root + options.framework),
  PATH: PATH.join(':'),
  PANTHEON_ENVIRONMENT: 'lando',
  PANTHEON_INDEX_HOST: PANTHEON_INDEX_HOST,
  PANTHEON_INDEX_PORT: PANTHEON_INDEX_PORT,
  PANTHEON_SITE: options.id,
  PANTHEON_SITE_NAME: options.site,
  php_version: options.php_version,
  PRESSFLOW_SETTINGS: JSON.stringify(getPantheonSettings(options)),
  TERMINUS_ENV: 'dev',
  // TERMINUS_ORG: ''
  TERMINUS_SITE: options.site,
  TERMINUS_USER: 'devuser@pantheon.io',
  SECURE_AUTH_KEY: getHash(options.app),
  SECURE_AUTH_SALT: getHash(options.app + options.root),
});
