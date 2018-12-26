'use strict';

// Modules
const _ = require('lodash');
const path = require('path');
const utils = require('./../../lib/utils');

/*
 * Helper to build cache service
 */
const getCache = () => ({
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
 * Helper to build edge service
 */
const getEdge = options => ({
  proxyService: 'edge',
  services: {
    edge: {
      type: 'varnish:4.1',
      backends: ['appserver_nginx'],
      ssl: true,
      config: {vcl: path.join(options.confDest, 'pantheon.vcl')},
    },
  },
  tooling: {
    varnishadm: {service: 'edge', user: 'root'},
  },
});

/*
 * Helper to build index service
 */
const getIndex = () => ({
  services: {
    index: {
      type: 'solr:custom',
      overrides: {
        image: 'devwithlando/pantheon-index:3.6-3',
        ports: ['449'],
        command: '/bin/bash /start.sh',
      },
    },
  },
});

/*
 * Build Drupal 7
 */
module.exports = {
  name: 'pantheon',
  parent: '_lamp',
  config: {
    cache: true,
    confSrc: __dirname,
    defaultFiles: {
      php: 'php.ini',
      database: 'mysql.cnf',
      server: 'nginx.conf.tpl',
    },
    edge: true,
    framework: 'drupal',
    index: true,
    services: {appserver: {overrides: {
      volumes: [
        '/var/www/.backdrush',
        '/var/www/.drupal',
        '/var/www/.drush',
        '/var/www/.terminus',
        '/var/www/.wp-cli',
      ],
    }}},
    tooling: {terminus: {
      service: 'appserver',
    }},
    xdebug: false,
    webroot: '.',
  },
  builder: (parent, config) => class LandoPantheon extends parent {
    constructor(id, options = {}) {
      // Merge in pantheon ymlz
      options = _.merge({}, config, options, utils.getPantheonConfig([
        path.join(options.root, 'pantheon.upstream.yml'),
        path.join(options.root, 'pantheon.yml'),
      ]));
      // Enforce certain options for pantheon parity
      options.via = 'nginx:1.14';
      options.database = 'mariadb:10.1';

      // Normalize because 7.0 gets handled strangely by js-yaml
      if (options.php === 7) options.php = '7.0';

      // Add in cache if applicable
      if (options.cache) options = _.merge({}, options, getCache());
      // Add in edge if applicable
      if (options.edge) options = _.merge({}, options, getEdge(options));
      // Add in index if applicable
      if (options.index) options = _.merge({}, options, getIndex());

      // Set correct things based on framework
      options.defaultFiles.vhosts = `${options.framework}.conf.tpl`;
      // Use our custom pantheon images
      options.services.appserver.overrides.image = `devwithlando/pantheon-appserver:${options.php}-2`;
      // Add in the prepend.ini
      // @TODO: this throws a weird DeprecationWarning: 'root' is deprecated, use 'global' for reasons not immediately clear
      options.services.appserver.overrides.volumes.push(`${options.confDest}/prepend.php:/srv/includes/prepend.php`);
      // Add in our environment
      options.services.appserver.overrides.environment = utils.getPantheonEnvironment(options);
      // Add in our pantheon script
      // NOTE: We do this here instead of in /scripts because we need to gaurantee
      // it runs before the other build steps so it can reset our CA correctly
      options.build_root = ['/helpers/pantheon.sh'];

      // @TODO: do we still need a depends on for the index for certs shit?
      // Set the appserver to depend on index start up so we know our certs will be there
      // const dependsPath = 'services.appserver.overrides.services.depends_on';
      // _.set(build, dependsPath, ['index']);

      // Send downstream
      super(id, options);
    };
  },
};
