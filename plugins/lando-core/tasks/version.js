'use strict';

module.exports = lando => ({
  command: 'version',
  describe: 'Display the lando version',
  run: () => {
    console.log('v' + lando.config.version);
  },
});
