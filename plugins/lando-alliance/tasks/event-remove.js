'use strict';

// Modules
const _ = require('lodash');
const LandoApiClient = require('./../lib/api');

module.exports = lando => {
  // Get the API client
  const api = new LandoApiClient(lando.log);
  // Return the task
  return {
    command: 'event:remove',
    level: 'tasks',
    describe: 'Removes a Lando event',
    options: {
      id: {
        describe: 'The resource id to remove',
        alias: ['i'],
        string: true,
        interactive: {
          type: 'list',
          message: 'Which event do you want to remove?',
          choices: _(api.read('events'))
            .map(event => ({name: event.name, value: event.id}))
            .value(),
        },
      },
      yes: lando.cli.confirm('Are you sure?'),
    },
    run: options => {
      const id = api.delete('events', options.id);
      console.log(`Removed event with id ${id}`);
    },
  };
};
