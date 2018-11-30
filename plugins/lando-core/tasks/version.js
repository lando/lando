'use strict';

module.exports = lando => ({
  command: 'version',
  describe: 'Displays the lando version',
  run: () => {
    console.log('v' + lando.config.version);
  },
});
