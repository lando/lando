'use strict';

module.exports = lando => {
  // Add additional things to cleanse
  lando.log.alsoSanitize('pantheon-auth');
};
