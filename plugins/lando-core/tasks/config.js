'use strict';

module.exports = lando => ({
  command: 'config',
  level: 'tasks',
  describe: 'Displays the lando configuration',
  run: () => console.log(JSON.stringify(lando.config, null, 2)),
});
