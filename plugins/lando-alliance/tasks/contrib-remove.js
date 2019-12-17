'use strict';

// Modules
const _ = require('lodash');
const LandoApiClient = require('./../lib/api');

module.exports = lando => {
  // Get the API client
  const api = new LandoApiClient(lando.log);
  // Return the task
  return {
    command: 'contrib:remove',
    level: 'tasks',
    describe: 'Removes a Lando Contributor',
    options: {
      id: {
        describe: 'The resource id to remove',
        alias: ['i'],
        string: true,
        interactive: {
          type: 'autocomplete',
          message: 'Which contributor?',
          source: (answers, input) => {
            if (!input) return lando.Promise.resolve(api.read('contributors'));
            return lando.Promise.resolve(_(api.read('contributors'))
              .filter(contributor => _.includes(contributor.name, input))
              .map(contributor => ({name: contributor.name, value: contributor.id}))
              .value());
          },
        },
      },
    },
    run: options => {
      api.delete('contributors', options.id);
    },
  };
};
