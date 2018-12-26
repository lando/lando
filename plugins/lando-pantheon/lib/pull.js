/*
  // Add in the pull command
  tools.pull = {
    service: 'appserver',
    description: 'Pull code, database and/or files from Pantheon',
    needs: ['database'],
    cmd: '/helpers/pull.sh',
    options: {
      code: {
        description: 'The environment to get the code from or [none]',
        passthrough: true,
        alias: ['c'],
        interactive: {
          type: 'list',
          message: 'Pull code from?',
          choices: function() {
            getEnvs(this.async());
          },
          default: config.env || 'dev',
          weight: 600,
        },
      },
      database: {
        description: 'The environment to get the db from or [none]',
        passthrough: true,
        alias: ['d'],
        interactive: {
          type: 'list',
          message: 'Pull DB from?',
          choices: function() {
            getEnvs(this.async());
          },
          default: config.env || 'dev',
          weight: 601,
        },
      },
      files: {
        description: 'The environment to get the files from or [none]',
        passthrough: true,
        alias: ['f'],
        interactive: {
          type: 'list',
          message: 'Pull files from?',
          choices: function() {
            getEnvs(this.async());
          },
          default: config.env || 'dev',
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
*/
