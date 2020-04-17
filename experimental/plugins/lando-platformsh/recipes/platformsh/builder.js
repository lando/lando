'use strict';

// Modules
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const utils = require('./../../lib/utils');
const yaml = require('js-yaml');

// Consts
const pshConfigFile = '.platform.app.yaml';
// const pshRoutesFile = path.join('.platform', 'routes.yaml');
// const pshServicesFile = path.join('.platform', 'services.yaml');

/*
 * Helper to map lagoon type data to a lando service
 */
const getLandoService = type => {
  switch (type) {
    case 'php': return 'platformsh-php';
    default: return false;
  };
};

/*
 * Helper to return a type and version from platform data
 */
const getAppserverType = ({name = 'appserver', type} = {}) => ({
  name,
  type: _.first(type.split(':')),
  version: _.last(type.split(':')),
});

/*
 * Build Platformsh
 */
module.exports = {
  name: 'platformsh',
  parent: '_recipe',
  config: {
    confSrc: __dirname,
    proxy: {},
    services: {},
    tooling: {},
  },
  builder: (parent, config) => class LandoPlatformsh extends parent {
    constructor(id, options = {}) {
      // Get our options
      options = _.merge({}, config, options);

      // Error if we don't have a platform.yml
      if (!fs.existsSync(path.join(options.root, pshConfigFile))) {
        throw Error(`Could not detect a ${pshConfigFile} at ${options.root}`);
      }
      const platformConfig = [yaml.safeLoad(fs.readFileSync(path.join(options.root, pshConfigFile)))];

      // Loop through and build our appservers
      // @TODO: We loop here because at some point platformConfig could contain a multiapp setup
      _.forEach(platformConfig, config => {
        // Get info about the appserver
        const {name, type, version} = getAppserverType(config);
        // Add it as a lando service if its supported
        if (getLandoService(type) !== false) {
          options.services[name] = _.merge({}, utils.getAppserver(type, config), {
            appserver: true,
            id: options.id,
            type: getLandoService(type),
            platformsh: config,
            version,
          });
        }
      });

      // Throw an error (warning?) if we have no appservers, this likely is because we dont support
      // the application type yet
      if (_.isEmpty(options.services)) {
        const types = _(platformConfig)
          .map(service => getAppserverType(service))
          .map(service => service.type)
          .value()
          .join(', ');
        throw Error(`No application detected! Lando does not currently support the application types: ${types}`);
      }

      // Add nginx stuff as needed
      /*
      if (_.includes(_.keys(options.services), 'nginx')) {
        options.proxy.nginx = [`${options.app}.${options._app._config.domain}:8080`];
      }

      // Add the php stuff like mailhog service
      // @NOTE: is this only applicable if we have a php service? we assume so for now
      if (_.includes(_.keys(options.services), 'php')) {
        options.services.mailhog = {type: 'mailhog:v1.0.0', hogfrom: ['php']};
        options.proxy.mailhog = [`inbox-${options.app}.${options._app._config.domain}`];
      }

      // Add cli stuff as needed
      if (_.includes(_.keys(options.services), 'mariadb')) {
        // Set creds we can use downstream
        options.services.mariadb.creds = {
          user: getLagoonEnv(options.services.mariadb, 'MARIADB_USER', options.flavor),
          password: getLagoonEnv(options.services.mariadb, 'MARIADB_PASSWORD', options.flavor),
          database: getLagoonEnv(options.services.mariadb, 'MARIADB_DATABASE', options.flavor),
          rootpass: getLagoonEnv(options.services.mariadb, 'MARIADB_ROOT_PASSWORD', 'Lag00n'),
        };
        // MYSQL
        options.tooling.mysql = {
          service: ':host',
          description: 'Drops into a MySQL shell on a database service',
          cmd: `mysql -uroot -p${_.get(options, 'services.mariadb.creds.rootpass', 'Lag00n')}`,
          user: 'root',
          options: {
            host: {
              description: 'The database service to use',
              default: 'mariadb',
              alias: ['h'],
            },
          },
        };
        // DB import
        // @TODO: eventually this should be added separately if we have EITHER postgres or mariadb
        options.tooling['db-import <file>'] = {
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
        };
        // DB export
        // @TODO: eventually this should be added separately if we have EITHER postgres or mariadb
        options.tooling['db-export [file]'] = {
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
        };
      };

      // Add a proxy setting for solr if we have it
      if (_.includes(_.keys(options.services), 'solr')) {
        options.proxy.solr = [`solradmin-${options.app}.${options._app._config.domain}:8983`];
      }
      */

      // Send downstream
      super(id, options);
    };
  },
};

/*
    services: {
      database: {
        meUser: 'web',
        scanner: false,
        build_as_root_internal: [
          '/helpers/boot-psh.sh',
          '/etc/platform/boot &> /dev/null',
        ],
        overrides: {
          privileged: true,
          image: 'docker.registry.platform.sh/mariadb-10.4',
          command: 'init',
          environment: {
            LANDO_WEBROOT_USER: 'web',
            LANDO_WEBROOT_GROUP: 'web',
            LANDO_WEBROOT_UID: '10000',
            LANDO_WEBROOT_GID: '10000',
            LANDO_NEEDS_EXEC: 'DOEEET',
          },
        },
      },
    },
  },
*/
