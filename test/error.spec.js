/**
 * Tests for table module.
 * @file table.spec.js
 */

'use strict';

const chai = require('chai');
const ErrorHandler = require('./../lib/error');
const EventEmitter = require('events').EventEmitter;
const Metrics = require('./../lib/metrics');
const Promise = require('./../lib/promise');
const sinon = require('sinon');
chai.should();
chai.use(require('chai-as-promised'));

describe('error', () => {
  describe('#ErrorHandler', () => {
    it('should return an ErrorHandler instance with correct default options', () => {
      const error = new ErrorHandler();
      error.should.be.instanceof(ErrorHandler);
      error.log.should.be.instanceof(EventEmitter);
      error.metrics.should.be.instanceof(Metrics);
    });
  });

  describe('#handle', () => {
    it('should return error code if specified', () => {
      const error = new ErrorHandler({error: sinon.spy()}, {report: () => Promise.resolve(true)});
      return error.handle({message: 'trouble trouble trouble', stack: 'stack', code: 666}).then(code2 => {
        code2.should.equal(666);
      });
    });

    it('should return 1 if error code is not specified', () => {
      const error = new ErrorHandler({error: sinon.spy()}, {report: () => Promise.resolve(true)});
      return error.handle({message: 'trouble trouble trouble', stack: 'stack'}).then(code1 => {
        code1.should.equal(1);
      });
    });

    it('should log message and report to metrics by default', () => {
      const error = new ErrorHandler({error: sinon.spy()}, {report: () => Promise.resolve(true)});
      return error.handle().then(code => {
        error.log.error.callCount.should.equal(1);
        code.should.equal(1);
      });
    });

    it('should not log error when error.hide is true', () => {
      const error = new ErrorHandler({error: sinon.spy()}, {report: () => Promise.resolve(true)});
      return error.handle({message: 'super long; don\'t log', stack: 'stack', hide: true}).then(() => {
        error.log.error.callCount.should.equal(0);
      });
    });

    it('should log stack instead of message when error.verbose > 0', () => {
      const error = new ErrorHandler({error: sinon.spy()}, {report: () => Promise.resolve(true)});
      return error.handle({message: 'message', stack: 'stack', verbose: 1, code: 4}).then(() => {
        error.log.error.callCount.should.equal(1);
        error.log.error.lastCall.args[0].should.equal('stack');
      });
    });
  });
});
