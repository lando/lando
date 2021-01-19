'use strict';

module.exports = {
  name: 'acquia',
  overrides: {
    // Suppress webroot prompt
    webroot: {
      when: () => false,
    },
  },
  options: lando => ({
    'foo': {
      describe: 'Testing option for the acquia recipe',
      string: true,
      interactive: {
        type: 'list',
        choices: {name: 'Bar', value: 'bar'},
        message: 'Select a foo',
        weight: 100,
        when: true,
      },
    },
  }),
};
