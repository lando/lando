/**
 * Tests for table module.
 * @file table.spec.js
 */

'use strict';

const chai = require('chai');
const os = require('os');
const Table = require('./../lib/table');
chai.should();

describe('table', () => {
  describe('#Table', () => {
    it('should return a Table instance with correct default options', () => {
      const table = new Table();
      table.should.be.instanceof(Table);
      table.options.head.should.be.empty;
      table.border.should.be.true;
      table.sort.should.be.false;
      table.joiner.should.equal(os.EOL);
      table.keyColor.should.equal('cyan');
      table.options.chars.should.have.property('bottom', '─');
    });

    it('should return a Table instance with custom options', () => {
      const table = new Table({}, {border: false, keyColor: 'green', sort: true, joiner: ', '});
      table.should.be.instanceof(Table);
      table.options.head.should.be.empty;
      table.border.should.be.false;
      table.sort.should.be.true;
      table.joiner.should.equal(', ');
      table.keyColor.should.equal('green');
      table.options.chars.should.have.property('bottom', '');
    });
  });

  describe('#add', () => {
    it('should add an objects keys and values as rows', () => {
      const table = new Table({
        taylor: 'swift',
        miley: 'cyrus',
        katy: 'perry',
        ariand: 'grande',
      });
      table.should.have.lengthOf(4);
    });

    it('should join array values with os.EOL by default', () => {
      const table = new Table();
      table.add({members: ['crosby', 'stills', 'nash', 'young']});
      table[0][1].should.equal(['crosby', 'stills', 'nash', 'young'].join(os.EOL));
    });

    it('should join array values with alternate opts.arrayJoiner if specified', () => {
      const table = new Table();
      table.add({members: ['crosby', 'stills', 'nash', 'young']}, {joiner: '='});
      table[0][1].should.equal('crosby=stills=nash=young');
    });
  });
});
