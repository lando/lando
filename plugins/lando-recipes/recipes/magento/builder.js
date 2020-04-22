'use strict';

// Modules
const _ = require('lodash');

/*
 * Helper to get cache
 */
const recommendedRedis = () => {
  return {
    type: 'redis:5.0',
    portforward: true,
    persist: true,
  };
};

/*
 * Helper to get services
 */
const getServiceDefaults = options => ({
  appserver: {
    // This can be removed after the Dockerfile extension updates have ben published
    build_as_root_internal: [
      // Prepare APT
      'apt update -yqq',
      // Install Magento Dependency ext-xsl
      'apt-get install libxslt-dev -yqq',
      'docker-php-ext-install xsl > /dev/null && docker-php-ext-enable xsl >/dev/null 2>/dev/null',
    ],
  },
});

const buildTooling = options => {
  // Add in Magento tooling
  const magentoCli = `php /app/${options.webroot}/../bin/magento`;
  options.tooling.magento = {
    description: 'Magento CLI tools',
    service: 'appserver',
    cmd: magentoCli,
  };

  options.tooling['magento:env:apply'] = {
    description: 'Configures Magento to use Lando\'s redis and database services',
    service: 'appserver',
    needs: ['cache', 'session', 'database'],
    cmd: [
      `${magentoCli} setup:config:set`,
      // Configure Cache for Magento
      '--cache-backend=redis --cache-backend-redis-server=cache',
      // Configure Session for Magento
      '--session-save=redis --session-save-redis-host=session',
      // Configure Database for Magento
      '--db-host=database --db-name=magento --db-user=magento --db-password=magento',
    ].join(' '),
  };
  options.tooling['magento:fresh'] = {
    description: 'Destroys your database, installs composer dependencies, and installs a brand new Magento!',
    service: 'appserver',
    needs: ['cache', 'session', 'database'],
    cmd: [
      // Ensure Composer is ready to go
      'composer install &&',
      // Configure Cache & Services
      `${options.tooling['magento:env:apply'].cmd} &&`,
      // Rebuild Magento Database
      `${magentoCli} setup:install`,
      '--cleanup-database',
      // Run Module Setup Scripts
      `&& ${magentoCli} setup:upgrade`,
      `&& ${magentoCli} deploy:mode:set developer`,
      `&& ${magentoCli} cache:flush`,
    ].join(' '),
  };

  options.tooling.magerun = {
    description: 'netz98 magerun CLI tools for Magento 2',
    service: 'appserver',
    cmd: `n98-magerun2`,
  };

  options.tooling['magento:create-project:community'] = {
    description: 'Create new Magento project in current directory',
    service: 'appserver',
    cmd: [
      'rm -f /var/www/.composer/auth.json',
      'rm -rf /tmp/magento',
      'composer create-project --repository=https://repo.magento.com/' +
      ' magento/project-community-edition /tmp/magento --no-install',
      'rsync -apv /tmp/magento/ .',
      'composer install',
    ],
  };

  options.tooling['magento:create-project:enterprise'] = {
    description: 'Create new Magento project in current directory',
    service: 'appserver',
    cmd: [
      'rm -f /var/www/.composer/auth.json',
      'rm -rf /tmp/magento',
      'composer create-project --repository=https://repo.magento.com/' +
      ' magento/project-enterprise-edition /tmp/magento --no-install',
      'rsync -apv /tmp/magento/ .',
      'composer install',
    ],
  };
};

/*
 * Build Magento
 */
module.exports = {
  name: 'magento',
  parent: '_lamp',
  config: {
    confSrc: __dirname,
    config: {},
    composer: {},
    // Magnto 2.* Compatible DB
    database: 'mariadb:10.2',
    defaultFiles: {
      php: 'php.ini',
    },
    php: '7.3',
    services: {appserver: {overrides: {environment: {
      APP_LOG: 'errorlog',
    }}}},
    tooling: {magento: {service: 'appserver'}},
    via: 'nginx',
    webroot: 'pub',
    xdebug: false,
    environment: {PHP_MEMORY_LIMIT: '2G'},
  },
  builder: (parent, config) => class LandoMagento extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      // Apply default service options
      options.services = _.merge({}, getServiceDefaults(options), options.services);
      // Add the magento cli installer command
      options.composer['n98/magerun2'] = '*';
      buildTooling(options);
      // Default to Magento-recommended cache service
      options.services.cache = recommendedRedis();
      // Default to Magento-recommended cache service
      options.services.session = recommendedRedis();
      // Send downstream
      super(id, options);
    };
  },
};
