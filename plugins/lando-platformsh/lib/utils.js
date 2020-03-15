'use strict';

// Modules
const _ = require('lodash');
const crypto = require('crypto');
const fs = require('fs');
const getDrush = require('./../../lando-recipes/lib/utils').getDrush;
const getPhar = require('./../../lando-recipes/lib/utils').getPhar;
const PlatformshApiClient = require('./client');
const path = require('path');
const yaml = require('js-yaml');

// Constants
const DRUSH_VERSION = '8.2.3';
const BACKDRUSH_VERSION = '0.0.6';
const PLATFORMSH_CACHE_HOST = 'cache';
const PLATFORMSH_CACHE_PORT = '6379';
const PLATFORMSH_CACHE_PASSWORD = '';
const PLATFORMSH_INDEX_HOST = 'index';
const PLATFORMSH_INDEX_PORT = '449';
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

// Things
const backdrushUrl = `https://github.com/backdrop-contrib/drush/archive/${BACKDRUSH_VERSION}.tar.gz`;
const wpCliUrl = 'https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar';
const wpStatusCheck = ['php', '/usr/local/bin/wp', '--allow-root', '--info'];
const backdrushInstall = [
  'curl', '-fsSL', backdrushUrl, '|', 'tar', '-xz', '--strip-components=1', '-C', '/var/www/.drush', '&&',
  'drush', 'cc', 'drush',
].join(' ');

// Pressflow and backdrop database settings
const platformshDatabases = {
  default: {
    default: {
      driver: 'mysql',
      prefix: '',
      database: 'platformsh',
      username: 'platformsh',
      password: 'platformsh',
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
 * Helper to get platformsh settings
 */
const getPlatformshSettings = options => ({
  databases: platformshDatabases,
  conf: {
    'pressflow_smart_start': true,
    'platformsh_binding': 'lando',
    'platformsh_site_uuid': options.id,
    'platformsh_environment': 'lando',
    'platformsh_tier': 'lando',
    'platformsh_index_host': PLATFORMSH_INDEX_HOST,
    'platformsh_index_port': PLATFORMSH_INDEX_PORT,
    'redis_client_host': PLATFORMSH_CACHE_HOST,
    'redis_client_port': PLATFORMSH_CACHE_PORT,
    'redis_client_password': PLATFORMSH_CACHE_PASSWORD,
    'file_public_path': 'sites/default/files',
    'file_private_path': 'sites/default/files/private',
    'file_directory_path': 'sites/default/files',
    'file_temporary_path': '/tmp',
    'file_directory_temp': '/tmp',
    'css_gzip_compression': false,
    'js_gzip_compression': false,
    'page_compression': false,
  },
  drupal_hash_salt: getHash(JSON.stringify(platformshDatabases)),
  config_directory_name: 'config',
});

/*
 * Helper to get build steps
 */
exports.getPlatformshBuildSteps = framework => {
  if (framework === 'wordpress') return [getPhar(wpCliUrl, '/tmp/wp-cli.phar', '/usr/local/bin/wp', wpStatusCheck)];
  else {
    const build = [getDrush(DRUSH_VERSION, ['drush', '--version'])];
    if (framework === 'drupal8') {
      build.push(getPhar(
        'https://drupalconsole.com/installer',
        '/tmp/drupal.phar',
        '/usr/local/bin/drupal')
      );
    }
    if (framework === 'backdrop') {
      build.push(backdrushInstall);
    }
    return build;
  }
};

/*
 * Helper to build cache service
 */
exports.getPlatformshCache = () => ({
  services: {
    cache: {
      type: 'redis:2.8',
      persist: true,
      portforward: true,
    },
  },
  tooling: {
    'redis-cli': {service: 'cache'},
  },
});

/*
 * Helper to merge in platformsh yamls
 */
exports.getPlatformshConfig = (files = ['platformsh.upstream.yml', 'platformsh.yml']) => _(files)
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
 * Helper to build edge service
 */
exports.getPlatformshEdge = options => ({
  proxyService: 'edge',
  services: {
    edge: {
      type: 'varnish:4.1',
      backends: ['appserver_nginx'],
      ssl: true,
      config: {vcl: path.join(options.confDest, 'platformsh.vcl')},
    },
  },
  tooling: {
    varnishadm: {service: 'edge', user: 'root'},
  },
});

/*
 * Helper to get platformsh envvars
 */
exports.getPlatformshEnvironment = options => ({
  AUTH_KEY: getHash(JSON.stringify(platformshDatabases)),
  AUTH_SALT: getHash(options.app + options.framework),
  BACKDROP_SETTINGS: JSON.stringify(getPlatformshSettings(options)),
  CACHE_HOST: PLATFORMSH_CACHE_HOST,
  CACHE_PORT: PLATFORMSH_CACHE_PORT,
  CACHE_PASSWORD: PLATFORMSH_CACHE_PASSWORD,
  DB_HOST: 'database',
  DB_PORT: 3306,
  DB_USER: 'platformsh',
  DB_PASSWORD: 'platformsh',
  DB_NAME: 'platformsh',
  DOCROOT: '/',
  DRUPAL_HASH_SALT: getHash(JSON.stringify(platformshDatabases)),
  drush_version: options.drush_version,
  FRAMEWORK: options.framework,
  FILEMOUNT: getFilemount(options.framework),
  LOGGED_IN_KEY: getHash(options.app),
  LOGGED_IN_SALT: getHash(options.root + options.app),
  NONCE_SALT: getHash(options.root + options.root),
  NONCE_KEY: getHash(options.root + options.framework),
  PATH: PATH.join(':'),
  PLATFORMSH_ENVIRONMENT: 'lando',
  PLATFORMSH_INDEX_HOST: PLATFORMSH_INDEX_HOST,
  PLATFORMSH_INDEX_PORT: PLATFORMSH_INDEX_PORT,
  PLATFORMSH_SITE: options.id,
  PLATFORMSH_SITE_NAME: options.site,
  php_version: options.php_version,
  PRESSFLOW_SETTINGS: JSON.stringify(getPlatformshSettings(options)),
  TERMINUS_ENV: 'dev',
  TERMINUS_HIDE_UPDATE_MESSAGE: 1,
  // TERMINUS_ORG: ''
  TERMINUS_SITE: options.site,
  TERMINUS_TOKEN: _.get(options, '_app.meta.token'),
  TERMINUS_USER: _.get(options, '_app.meta.email'),
  SECURE_AUTH_KEY: getHash(options.app),
  SECURE_AUTH_SALT: getHash(options.app + options.root),
});

/*
 * Helper to build index service
 */
exports.getPlatformshIndex = () => ({
  services: {
    index: {
      type: 'solr:custom',
      overrides: {
        image: 'devwithlando/platformsh-index:3.6-3',
        ports: ['449'],
        command: '/bin/bash -c "/helpers/add-cert.sh && /start.sh"',
        environment: {
          LANDO_NO_USER_PERMS: 'NOTGONNAGOIT',
        },
      },
    },
  },
});

/*
 * Helper to build index service
 */
exports.getPlatformshInquirerEnvs = (token, site, nopes = [], log = console.log) => {
  const api = new PlatformshApiClient(token, log);
  return api.auth().then(() => api.getSiteEnvs(site)
  .map(env => ({name: env.id, value: env.id}))
  .filter(env => !_.includes(nopes, env.value))
  .then(envs => _.flatten([envs, [{name: 'none', value: 'none'}]])))
  .catch(err => {
    throw (_.has(err, 'response.data')) ? new Error(err.response.data) : err;
  });
};

/*
 * Helper to get tooling
 */
exports.getPlatformshTooling = framework => {
  if (framework === 'wordpress') return {wp: {service: 'appserver'}};
  else {
    const tooling = {drush: {service: 'appserver'}};
    if (framework === 'drupal8') {
      tooling.drupal = {service: 'appserver', description: 'Runs drupal console commands'};
    }
    return tooling;
  }
};

/*
 * Helper to get terminus tokens
 */
exports.getPlatformshTokens = home => {
  if (fs.existsSync(path.join(home, '.platformsh', 'cache', 'tokens'))) {
    return _(fs.readdirSync(path.join(home, '.platformsh', 'cache', 'tokens')))
      .map(tokenFile => path.join(home, '.platformsh', 'cache', 'tokens', tokenFile))
      .map(file => JSON.parse(fs.readFileSync(file, 'utf8')))
      .value();
  } else {
    return [];
  }
};

/*
 * Helper to return most recent tokens
 */
exports.sortTokens = (...sources) => _(_.flatten([...sources]))
  .sortBy('date')
  .groupBy('email')
  .map(tokens => _.last(tokens))
  .value();
