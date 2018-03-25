/**
 * Tests for cache system.
 * @file cache.spec.js
 */

'use strict';

// Setup chai.
const chai = require('chai');
const expect = chai.expect;

// Get caching module to test
const Cache = require('./../../lib/cache');
const cache = new Cache();

// This is the file we are testing
describe('cache', function() {

  // This is the method we are testing
  describe('#Cache', function() {
    it('returns a cache instance with correct default options');
    it('returns a cache instance with custom log option');
    it('returns a cache instance with custom cachedir option');
    it('sets up the cache directory');
  });

  // This is the method we are testing
  describe('#__get', function() {
    it('is the same as new NodeCache().get');
  });

  // This is the method we are testing
  describe('#__set', function() {
    it('is the same as new NodeCache().set');
  });

  // This is the method we are testing
  describe('#__del', function() {
    it('is the same as new NodeCache().del');
  });

  // This is the method we are testing
  describe('#set', function() {
    it('sets a cached key in memory');
    it('destroys a cached key in memory after ttl has expired');
    it('sets a cached key in a file if persist is set');
    it('handles windows things: see @todos in code');
  });

  // This is the method we are testing
  describe('#get', function() {

    it('returns a cached key from memory');
    it('fails to return a cached key from memory if ttl is expired');
    it('returns a cached key from file if persists is set');
    it('handles windows things: see @todos in code');

    // Retrieving a stale key should result in nothing
    it('returns undefined when grabbing an unset key', function() {

      // Get the result of a key that has not been set
      const result = cache.get('BOGUSKEY-I-LOVE-NICK3LBACK-4-LYF');

      // What were you expecting?
      expect(result).to.be.undefined;

    });

  });

  // This is the method we are testing
  describe('#remove', function() {
    it('removes a cached key from memory');
    it('removes a cached key from file');
    it('handles windows things: see @todos in code');
  });

});
