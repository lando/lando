/**
 * Tests for table module.
 * @file table.spec.js
 */

'use strict';

const _ = require('lodash');
const chai = require('chai');
const Table = require('./../../lib/table');
chai.should();

describe('table', () => {
  describe('#Table', () => {
    it('should return a Table instance with correct default options', () => {
      const table = new Table();
      table.should.be.instanceof(Table);
      table.options.head.should.be.empty;
      table.options.chars.should.have.property('bottom', '');
    });
  });

  describe('#add', () => {
    it('should add a key and value row to a table', () => {
      const table = new Table();
      const data = {
        taylor: 'swift',
        miley: 'cyrus',
        katy: 'perry',
      };
      let counter = 0;
      _.forEach(data, (value, key) => {
        table.add(key, value);
        _.includes(table[counter][0], key).should.be.true;
        table[counter][1].should.equal(value);
        counter = counter + 1;
      });
    });

    it('should join array values with ", " by default', () => {
      const table = new Table();
      const data = ['crosby', 'stills', 'nash', 'young'];
      table.add('csny', data);
      table[0][1].should.equal('crosby, stills, nash, young');
    });

    it('should join array values with alternate opts.arrayJoiner if specified', () => {
      const table = new Table();
      const data = ['crosby', 'stills', 'nash', 'young'];
      table.add('csny', data, {arrayJoiner: '='});
      table[0][1].should.equal('crosby=stills=nash=young');
    });
  });
});
