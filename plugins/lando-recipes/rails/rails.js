/**
* Rails recipe
*
* @name Rails
*/
'use strict';
const Rails = require('./lib/Recipes/Rails');

module.exports = function(lando) {
  let rails = new Rails(lando);
  // Return things
  return {
    build: rails.build,
    configDir: __dirname
  };
};
