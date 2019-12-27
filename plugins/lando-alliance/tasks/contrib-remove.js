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
          type: 'list',
          message: 'Which contributor do you want to remove?',
          choices: _(api.read('contributors'))
            .map(contributor => ({name: contributor.name, value: contributor.id}))
            .value(),
        },
      },
      yes: lando.cli.confirm('Are you sure?'),
    },
    run: options => {
      const id = api.delete('contributors', options.id);
      console.log(`Removed contributor with id ${id}`);
    },
  };
};
