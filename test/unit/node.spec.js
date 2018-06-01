/**
 * Tests for node module.
 * @file node.spec.js
 */

'use strict';

// Setup chai.
const _ = require('lodash');
const chai = require('chai');
const expect = chai.expect;
chai.should();

// Get node module to test
const node = require('./../../lib/node');

// This is the file we are testing
describe('node', () => {

  describe('#node', () => {

    // Ensure node is a non-empty object
    it('is a non-empty object', () => {
      expect(node).to.be.an('object');
      expect(node).to.not.be.empty;
    });

    // Ensure node has non-empty ojects as properties
    it('has non-empty properties', () => {
      _.forEach(node, value => {
        expect(value).to.not.be.empty;
      });
    });

    // Ensure node's object properties contain at least one property that is a function
    it('has properties that themselves contain at least one function', () => {
      _.forEach(node, value => {
        const types = _.map(value, prop => typeof prop);
        expect(types).to.include('function');
      });
    });

  });

});
