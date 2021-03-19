'use strict';

// Modules
const _ = require('lodash');
const auth = require('./auth');
const utils = require('./utils');

// The non dynamic base of the task
const task = {
  service: 'appserver',
  description: 'Pull code, database and/or files from Pantheon',
  cmd: '/helpers/pull.sh',
  level: 'app',
  stdio: ['inherit', 'pipe', 'pipe'],
  options: {
    auth: {
      describe: 'Pantheon machine token',
      passthrough: true,
      string: true,
      interactive: {
        type: 'list',
        message: 'Choose a Pantheon account',
        choices: [],
        when: () => false,
        weight: 100,
      },
    },
    code: {
      description: 'The environment from which to pull the code',
      passthrough: true,
      alias: ['c'],
      interactive: {
        type: 'list',
        message: 'Pull code from?',
        weight: 600,
      },
    },
    database: {
      description: 'The environment from which to pull the database',
      passthrough: true,
      alias: ['d'],
      interactive: {
        type: 'list',
        message: 'Pull database from?',
        weight: 601,
      },
    },
    files: {
      description: 'The environment from which to pull the files',
      passthrough: true,
      alias: ['f'],
      interactive: {
        type: 'list',
        message: 'Pull files from?',
        weight: 602,
      },
    },
    rsync: {
      description: 'Rsync the files, good for subsequent pulls',
      passthrough: true,
      boolean: true,
      default: false,
    },
  },
};

const frameworkType = (framework = 'drupal8') => {
  if (_.startsWith(framework, 'wordpress')) return 'pressy';
  else return 'drupaly';
};

// Helper to build db pull command
const buildDbPullCommand = ({framework = 'drupal8', drush_version = 8} = {}) => {
  // Wordpress
  if (frameworkType(framework) === 'pressy') {
    return {
      command: 'terminus remote:wp',
      options: '-- db export -',
    };
  }

  // Drupaly
  return {
    command: 'terminus remote:drush',
    options: '-- sql-dump --structure-tables-list=cache,cache_*',
  };
};

// Helper to populate defaults
const getDefaults = (task, options) => {
  // Set interactive options
  _.forEach(['code', 'database', 'files'], name => {
    task.options[name].interactive.choices = answers => {
      return utils.getPantheonInquirerEnvs(
      answers.auth,
      options.id,
      [],
      options._app.log);
    };
    task.options[name].interactive.default = options.env;
  });

  // Get the framework flavor
  const flavor = frameworkType(options.framework);
  const pullCommand = buildDbPullCommand(options);
  // Set envvars
  task.env = {
    // These LANDO_DB_PULL_* vars are separate because
    // integrations/lando-pantheon/scripts/pull.sh needs to concatenate the
    // specified <site.env> between them.
    LANDO_DB_PULL_COMMAND: pullCommand.command,
    LANDO_DB_PULL_COMMAND_OPTIONS: pullCommand.options,
    LANDO_DB_USER_TABLE: flavor === 'pressy' ? 'wp_users' : 'users',
  };

  return task;
};

/*
 * Helper to build a pull command
 */
exports.getPantheonPull = (options, tokens = []) => {
  return _.merge({}, getDefaults(task, options), {options: auth.getAuthOptions(options._app.meta, tokens)});
};
