/**
 * Tests for table module.
 * @file table.spec.js
 */

'use strict';

const _ = require('lodash');
const art = require('./../../lib/art');
const chai = require('chai');
const os = require('os');
chai.should();

describe('art', () => {
  it('should return a function', () => {
    art.should.be.a('function');
  });

  it('should return start header with single top and bottom padding by default, joined by OS specific EOL', () => {
    const startHeader = art();
    _.includes(startHeader, 'BOOMSHAKALAKA').should.be.true;
    _.startsWith(startHeader, os.EOL).should.be.true;
    _.endsWith(startHeader, os.EOL).should.be.true;
  });

  it('should handle specified top and bottom padding', () => {
    _.forEach(_.range(10), () => {
      const top = _.random(0, 10);
      const bottom = _.random(0, 8);
      const initHeader = art('init', {paddingTop: top, paddingBottom: bottom});
      _.includes(initHeader, 'FIRE').should.be.true;
      _.startsWith(initHeader, _.map(_.range(top), () => os.EOL).join('')).should.be.true;
      _.endsWith(initHeader, _.map(_.range(bottom), () => os.EOL).join('')).should.be.true;
    });
  });
});
