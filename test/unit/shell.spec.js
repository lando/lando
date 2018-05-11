/**
 * Tests for updates module.
 * @file updates.spec.js
 */

'use strict';

const chai = require('chai');
const sinon = require('sinon');
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));
chai.should();

const shell = require('../../lib/shell')();
const _shell = require('shelljs');
describe('shell', () => {
  describe('#exec', function() {
    it('should be silent by default', function() {
      const stub = sinon.stub(_shell, 'exec');
      shell.exec('foo', {});
      stub.should.be.calledWith('foo', {silent: true});
      stub.restore();
    });

    it('should reject on a non-zero exit', function() {
      const stub = sinon.stub(_shell, 'exec').returns({code:1});
      shell.exec('nonsense').should.eventually.be.rejectedWith(Error);
      stub.should.be.calledWith('nonsense');
      stub.restore();
    });

    it('should resolve on a zero exit', function() {
      const stub = sinon.stub(_shell, 'exec')
        .returns({code: 0, stdout: 'Excellent!'});

      shell.exec('billandted').should.eventually.equal('Excellent!');

      stub.should.be.calledWith('billandted');
      stub.restore();
    });
  });

  describe('#spawn', function() {

  });

  describe('#sh', function() {

  });

  describe('#escSpaces', function() {

  });
});
