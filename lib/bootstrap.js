/**
 * Lando initialization system.
 *
 * @name bootstrap
 */

'use strict';

// Grab required modules
var _ = require('./node')._;
var Promise = require('./promise');

/**
 * Document
 */
module.exports = _.once(function(opts, done) {

  // Start promise chain.
  return Promise.resolve()

  // Bind an empty object.
  .bind({})

  // Load, register the global config and then set it into the env
  .then(function() {
    //var self = this;
    return Promise.try(function() {
      //self.globalConfig = core.config.getGlobalConfig();
    })
    .catch(function(err) {
      throw new Error(err, 'Failed to load global config.');
    })
    .then(function() {
      //core.deps.register('globalConfig', self.globalConfig);
      //core.deps.register('config', self.globalConfig);
    })
    .then(function() {
      //core.env.setEnvFromObj(self.globalConfig);
    });
  })

  // Allow callback or returning of a promise.
  .nodeify(done);

});
