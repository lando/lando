/**
 * Tests for table module.
 * @file table.spec.js
 */

'use strict';

const _ = require('lodash');
const art = require('./../lib/art');
const chai = require('chai');
const os = require('os');
chai.should();

describe('art', () => {
  it('should return an object', () => {
    art.should.be.an('object');
  });

  _.forEach(_.keys(art), key => {
    it(`it should run ${key} without an error and return a string`, () => {
      const result = art[key]();
      result.should.be.a('string');
    });
  });
});
