/**
 * This adds proxy settings to our config
 *
 * @name bootstrap
 */

'use strict';

module.exports = function(lando) {

  // Modules
  var _ = lando.node._;

  // Add in some high level config for our proxy
  lando.events.on('post-bootstrap', function(lando) {

    // Log
    lando.log.info('Initializing proxy');

    // Proxy defaults
    var defaults = {
      proxy: 'ON',
      proxyDomain: 'lndo.site',
      proxyDash: '58087',
      proxyHttpPort: '80',
      proxyHttpsPort: '443',
      proxyHttpFallbacks: ['8000', '8080', '8888', '8008'],
      proxyHttpsFallbacks: ['444', '4433', '4444', '4443']
    };

    // Merge config over defaults
    lando.config = _.mergeWith(defaults, lando.config, lando.utils.merger);

    // Grab the merged config
    var proxyConf = {
      proxy: lando.config.proxy,
      proxyDash: lando.config.proxyDash,
      proxyHttpPort: lando.config.proxyHttpPort,
      proxyHttpsPort: lando.config.proxyHttpsPort,
      proxyHttpFallbacks: lando.config.proxyHttpFallbacks,
      proxyHttpsFallbacks: lando.config.proxyHttpsFallbacks,
    };

    // Log it
    lando.log.verbose('Proxy initialized with config', proxyConf);

  });

};
