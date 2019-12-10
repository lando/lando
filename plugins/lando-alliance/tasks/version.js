'use strict';

module.exports = lando => ({
  command: 'alliance',
  level: 'tasks',
  describe: 'Displays the lando version',
  run: () => {
    console.log('v' + lando.config.version);
  },
});
