'use strict';
const _ = require('lodash');

module.exports = lando => ({
  command: 'stuff',
  level: 'tasks',
  describe: 'Tests an app loaded plugin',
  run: () => {
    console.log('I WORKED!');
  },
});
