'use strict';

// Helper to get a build array of run thingz
exports.get = () => ({
  'composer': {
    service: 'cli',
    cmd: '/usr/local/bin/composer --ansi',
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
    cmd: 'drush',
  },
  'php': {
    service: 'cli',
    cmd: '/usr/local/bin/php',
  },
});
