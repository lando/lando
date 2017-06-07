/**
 * LAMP recipe builder
 *
 * @name lamp
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;

  /**
   * Build out LAMP
   */
  var build = function(name, config) {

    return _.merge(config, {hello: 'there'});

  };

  // Return teh build func
  return build;

};
