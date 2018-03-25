/**
 * Tests for config system.
 * @file config.spec.js
 */

'use strict';

// Setup chai.
const chai = require('chai');
const expect = chai.expect;
chai.should();

// Get caching module to test
const config = require('./../../lib/config');

// This is the file we are testing
describe('config', function() {

  describe('#tryConvertJson', function() {

    it('returns the unaltered input if input is not a parsable JSON string', function() {

      // Input value
      const input = 'obiwan';

      // Get the result of a JSON parse
      const result = config.tryConvertJson(input);

      // What were you expecting?
      expect(result).to.be.a('string');
      expect(result).to.equal(input);

    });

    // NOTE: means the JSON string is enclosed by {}
    it('returns an object if input is a parsable JSON string representing an object', function() {

      // Input value
      const input = '{}';

      // Get the result of a JSON parse
      const result = config.tryConvertJson(input);

      // What were you expecting?
      expect(result).to.be.an('object');

    });

    // NOTE: means the JSON string is enclosed by []
    it('returns an array if input is a parsable JSON string representing an array', function() {

      // Input value
      const input = '[]';

      // Get the result of a JSON parse
      const result = config.tryConvertJson(input);

      // What were you expecting?
      expect(result).to.be.an('array');

    });

  });

  describe('#merge', function() {
    it('merge like lodash merge without array data');
    it('concat array data');
  });

  describe('#stripEnvs', function() {

    it('returns process.env stripped of all keys that start with prefix', function() {

      // Add mock data to process.env
      process.env.DANCE_NOW = 'everybody';

      const result = config.stripEnv('DANCE');

      expect(result).to.be.an('object');
      expect(result).to.not.have.key('DANCE_NOW');
      expect(process.env).to.not.have.key('DANCE_NOW');

    });

  });

  describe('#defaults', function() {
    it('defaults');
  });

  describe('#loadFiles', function() {
    it('loadfiles');
  });

  describe('#loadEnvs', function() {

    it('returns an object built from all keys from process.env that start with a given prefix', function() {

      // Add mock data to process.env
      process.env.DANCE_NOW = 'everybody';

      const result = config.loadEnvs('DANCE');

      expect(result).to.be.an('object');
      expect(result).to.have.key('now');
      expect(result.now).to.equal(process.env.DANCE_NOW);

    });

  });

});
