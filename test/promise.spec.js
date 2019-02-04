/**
 * Tests for promise system.
 * @file promise.spec.js
 */

'use strict';

const _ = require('lodash');
const chai = require('chai');
const sinon = require('sinon');
chai.use(require('chai-as-promised'));
chai.should();

const Promise = require('../lib/promise');

describe('promise', () => {
  describe('#Promise', () => {
    it('should have our retry method', () => {
      Promise.retry.should.be.a('function');
    });

    it('should return a promise instance', () => {
      const promise = new Promise(sinon.spy());
      promise.should.be.instanceof(Promise);
    });

    it('should have longStackTraces enabled on instances', () => {
      const promise = new Promise(sinon.spy());
      promise.should.have.property('_trace');
    });

    it('should have our retry method on instances', () => {
      const promise = new Promise(sinon.spy());
      Object.getPrototypeOf(promise).retry.should.be.a('function');
    });
  });

  describe('#retry', () => {
    it('should immediately fulfill without retry if promise is not rejected', () => {
      let counter = 0;
      const func = () => {
        counter = counter + 1;
        return Promise.resolve(counter);
      };
      Promise.retry(func).should.eventually.equal(1).and.should.be.fulfilled;
    });

    it('should retry a rejected promise max times with backoff and then reject with Error', () => {
      const opts = {max: _.random(1, 7), backoff: _.random(1, 25)};
      const fail = () => {
        counter = counter + 1;
        return Promise.reject(new Error('Death by Balrog'));
      };
      const assertz = () => {
        const timer = new Date().getTime();
        const minTime = ((opts.max * (opts.max + 1)) / 2) * opts.backoff;
        counter.should.equal(opts.max);
        timer.should.be.at.least(minTime);
        clock.restore();
      };
      let counter = -1;
      const clock = sinon.useFakeTimers({now: 0, shouldAdvanceTime: true});
      return Promise.retry(fail, opts).finally(assertz).should.be.rejectedWith(Error, 'Death by Balrog');
    });
  });
});
