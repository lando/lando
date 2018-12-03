'use strict';

module.exports = lando => ({
  command: 'config',
  describe: 'Display the lando configuration',
  run: () => console.log(JSON.stringify(lando.config, null, 2)),
});
