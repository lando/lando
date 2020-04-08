'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/*
 * Build Lagoon
 */
module.exports = {
  name: 'lagoon',
  parent: '_recipe',
  config: {
    confSrc: __dirname,
    flavor: 'drupal',
    xdebug: false,
    webroot: '.',
    proxy: {},
    services: {},
    tooling: {},
  },
  builder: (parent, config) => class LandoLagoon extends parent {
    constructor(id, options = {}) {
      // Get our options
      options = _.merge({}, config, options);

      // Start by grabbing our dockercompose stuff
      const lagoonConfig = yaml.safeLoad(fs.readFileSync(path.join(options.root, '.lagoon.yml')));
      const composeConfig = yaml.safeLoad(fs.readFileSync(path.join(options.root, lagoonConfig['docker-compose-yaml'])));

      // Prune things for now
      const baselineConfig = _(composeConfig.services)
        // Map into arrays
        .map((value, key) => _.merge({}, value, {name: key}))
        // Filter out aux services
        // @TODO: progressively add these back in
        .filter(service => _.includes(['cli', 'nginx', 'php', 'redis', 'mariadb'], service.name))
        // Remove things that lando will set on its own
        .map(service => _.omit(service, ['volumes', 'volumes_from', 'networks']))
        .value();

      // Loop through and make some changes
      _.forEach(baselineConfig, service => {
        // Set the dockerfile to an absolute path
        if (_.has(service, 'build.dockerfile')) {
          service.build.dockerfile = path.join(options.root, service.build.dockerfile);
        }
        // Replace with the users UID
        if (service.user === '1000') {
          service.user = options._app._config.uid;
        }

        // Translate into lando compose services
        const name = service.name;
        delete service.name;
        options.services[name] = {
          type: 'compose',
          services: service,
        };
      });

      // Set amazee commands on top of landos
      options.services.cli.services.command = '/sbin/tini -- /lagoon/entrypoints.sh /bin/docker-sleep';
      options.services.mariadb.services.command = '/sbin/tini -- /lagoon/entrypoints.bash mysqld';
      options.services.nginx.services.command = '/sbin/tini -- /lagoon/entrypoints.sh nginx -g "daemon off;"';
      options.services.nginx.services.ports = ['8080'];
      options.services.php.services.command = '/sbin/tini -- /lagoon/entrypoints.sh /usr/local/sbin/php-fpm -F -R';
      options.services.redis.services.command = '/sbin/tini -- /lagoon/entrypoints.sh redis-server /etc/redis/redis.conf';

      // Set basic tooling things
      options.tooling = {
        'composer': {
          service: 'cli',
          cmd: '/usr/local/bin/composer --ansi',
          user: options.services.cli.services.user,
        },
        'db-import <file>': {
          service: ':host',
          description: 'Imports a dump file into a database service',
          cmd: '/helpers/sql-import.sh',
          options: {
            'host': {
              description: 'The database service to use',
              default: 'mariadb',
              alias: ['h'],
            },
            'no-wipe': {
              description: 'Do not destroy the existing database before an import',
              boolean: true,
            },
          },
        },
        'db-export [file]': {
          service: ':host',
          description: 'Exports database from a database service to a file',
          cmd: '/helpers/sql-export.sh',
          user: 'root',
          options: {
            host: {
              description: 'The database service to use',
              default: 'mariadb',
              alias: ['h'],
            },
            stdout: {
              description: 'Dump database to stdout',
            },
          },
        },
        'drush': {
          service: 'cli',
          cmd: '/usr/local/bin/drush',
          user: options.services.cli.services.user,
        },
        'php': {
          service: 'cli',
          cmd: '/usr/local/bin/php',
          user: options.services.cli.services.user,
        },
      };

      // Set a basic proxy thing
      options.proxy = {
        nginx: [
          `${options.app}.${options._app._config.domain}:8080`
        ],
      };

      // console.log(JSON.stringify(options.services, null, 2));
      // process.exit(1)

      // Send downstream
      super(id, options);
    };
  },
};
