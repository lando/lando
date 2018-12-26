/*
  // Add in the push command
  tools.push = {
    service: 'appserver',
    description: 'Push code, database and/or files to Pantheon',
    cmd: '/helpers/push.sh',
    needs: ['database'],
    options: {
      code: {
        description: 'The environment to push the code to or [none]',
        default: 'dev',
        passthrough: true,
        alias: ['c'],
        interactive: {
          type: 'list',
          message: 'Push code to?',
          choices: function() {
            getEnvs(this.async(), ['test', 'live']);
          },
          default: 'dev',
          weight: 500,
        },
      },
      message: {
        description: 'A message describing your change',
        passthrough: true,
        alias: ['m'],
        interactive: {
          type: 'string',
          message: 'What did you change?',
          default: 'My awesome Lando-based changes',
          weight: 600,
          when: function(answers) {
            return answers.code !== 'none' && lando.cli.argv().code !== 'none';
          },
        },
      },
      database: {
        description: 'The environment to push the db to or [none]',
        passthrough: true,
        alias: ['d'],
        interactive: {
          type: 'list',
          message: 'Push db to?',
          choices: function() {
            getEnvs(this.async(), ['test', 'live']);
          },
          default: 'none',
          weight: 601,
        },
      },
      files: {
        description: 'The environment to push the files to or [none]',
        passthrough: true,
        alias: ['f'],
        interactive: {
          type: 'list',
          message: 'Push files to?',
          choices: function() {
            getEnvs(this.async(), ['test', 'live']);
          },
          default: 'none',
          weight: 602,
        },
      },
    },
  };
*/

