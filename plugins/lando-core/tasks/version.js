'use strict';
const _ = require('lodash');

module.exports = lando => ({
  command: 'version',
  level: 'tasks',
  describe: 'Displays the lando version',
  options: {
    all: {
      describe: 'Shows additional version information',
      alias: ['-a'],
    },
  },
  run: options => {
    const versions = _.merge({}, lando.versions, {lando: lando.config.version});
    if (options.all) console.log(versions);
    else console.log(`v${versions.lando}`);
  },
});
