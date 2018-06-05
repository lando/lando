'use strict';

// Modules
const _ = require('lodash');
const Log = require('./logger');
const Promise = require('./promise');
const rest = require('restler');

// We make this module into a function so we can pass in a logger
module.exports = (log = new Log()) => {
  /**
   * Scans URLs to determine if they are up or down.
   *
   * @since 3.0.0
   * @alias lando.scanUrls
   * @param {Array} urls An array of urls like `https://mysite.lndo.site` or `https://localhost:34223`
   * @param {Object} [opts] Options to configure the scan.
   * @param {Integer} [opts.max=7] The amount of times to retry accessing each URL.
   * @param {Array} [opts.waitCode=[400, 502]] The HTTP codes to prompt a retry.
   * @return {Array} An array of objects of the form {url: url, status: true|false}
   * @example
   * // Scan URLs and print results
   * return lando.utils.scanUrls(['http://localhost', 'https://localhost'])
   * .then(function(results) {
   *   console.log(results);
   * });
   */
  const scanUrls = (urls, {max = 7, waitCode = [400, 502, 404]} = {}) => {
    // Log
    log.debug('Starting url scan with opts', {max, waitCode});
    // Ping the sites for awhile to determine if they are g2g
    return Promise.map(urls, url => Promise.retry(() => {
      // Log the attempt
      log.info('Checking to see if %s is ready.', url);

      // Send REST request.
      return new Promise((fulfill, reject) => {
        // If URL contains a wildcard then immediately set fulfill with yellow status
        if (_.includes(url, '*')) return fulfill({url: url, status: true, color: 'yellow'});
        // Make the actual request, lets make sure self-signed certs are OK
        rest.get(url, {rejectUnauthorized: false, followRedirects: false})
        // The URL is accesible
        .on('success', () => {
          log.verbose('%s is now ready.', url);
          fulfill({url: url, status: true, color: 'green'});
        })

        // Throw an error on fail/error
        .on('fail', (data, response) => {
          // Get the code
          const code = response.statusCode;
          // If we have a wait code try again
          if (_.includes(opts.waitCodes, code)) {
            log.debug('%s not yet ready with code %s.', url, code);
            reject({url: url, status: false, color: 'red'});
          } else {
            log.debug('%s is now ready.', url);
            fulfill({url: url, status: true, color: 'green'});
          }
        })
        // Something else bad happened
        .on('error', reject);
      });
    }, {max})

    // Catch any error and return an inaccesible url
    .catch(err => {
      log.verbose('%s is not accessible', url);
      log.debug('%s not accessible with error', url, err.message);
      return {url: url, status: false, color: 'red'};
    }))

    // Log and then return scan results
    .then(results => {
      log.debug('URL scan results', results);
      return results;
    });
  };

  // Return
  return scanUrls;
};
