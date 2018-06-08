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

const node = require('./../../lib/node');

describe('node', () => {
  describe('#node', () => {
    it('should return a non-empty object', () => {
      expect(node).to.be.an('object');
      expect(node).to.not.be.empty;
    });

    it('should have non-empty properties', () => {
      _.forEach(node, value => {
        expect(value).to.not.be.empty;
      });
    });

    it('should have properties that themselves contain at least one function', () => {
      _.forEach(node, value => {
        const types = _.map(value, prop => typeof prop);
        expect(types).to.include('function');
      });
    });
  });
});
