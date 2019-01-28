'use strict';

// Modules
const _ = require('lodash');
const url = require('valid-url');

module.exports = {
  sources: [{
    name: 'remote',
    label: 'remote git repo or archive',
    options: lando => ({
      'remote-url': {
        describe: 'The URL of your git repo or archive, only works when you set source to remote',
        string: true,
        interactive: {
          type: 'input',
          message: 'Please enter the URL of the git repo or tar archive containing your application code',
          when: answers => answers.source === 'remote',
          validate: input => {
            const uri = (_.includes(input, '@')) ? input.split('@')[1] : input;
            if (url.isUri(uri)) return true;
            else return `${input} does not seem to be a valid uri!`;
          },
          weight: 110,
        },
      },
      'remote-options': {
        default: '',
        describe: 'Some options to pass into either the git clone or archive extract command',
        string: true,
      },
    }),
    build: options => {
      return [{
        name: 'get-asset',
        cmd: `/helpers/get-remote-url.sh ${options['remote-url']} "${options['remote-options']}"`,
        remove: true,
      }];
    },
  }],
};
