'use strict';

// Modules
// const _ = require('lodash');

/*
 * Helper to map lagoon type data to a lando service
 */
/*
const getToolingByType = type => {
  switch (type) {
    case 'php': return 'platformsh-php';
    case 'mariadb': return 'platformsh-mariadb';
    case 'mysql': return 'platformsh-mariadb';
    default: return false;
  };
};
*/

/*
 * Maps parsed platform config into related Lando things
 */
exports.getAppTooling = app => {
  // Start with the things we need regardless of type
  const tooling = {platform: {service: app.name}};

  // Get type specific things

  // Return it al
  return tooling;
};
