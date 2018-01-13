/**
 * Tests for cache system.
 * @file cache.spec.js
 */

'use strict';

// Setup chai.
var chai = require('chai');
var expect = chai.expect;
chai.should();

// Get caching module to test
var Cache = require('./../../lib/cache');
var cache = new Cache();

// This is the file we are testing
describe('cache', function() {

  // This is the method we are testing
  describe('#get', function() {

    // Retrieving a stale key should result in nothing
    it('returns undefined when grabbing an unset key', function() {

      // Get the result of a key that has not been set
      var result = cache.get('BOGUSKEY-I-LOVE-NICK3LBACK-4-LYF');

      // What were you expecting?
      expect(result).to.be.undefined;

    });

  });

});
