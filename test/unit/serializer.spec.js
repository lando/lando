/**
 * Tests for Serializer.
 * @file serializer.spec.js
 */

'use strict';

const _ = require('lodash');
const chai = require('chai');
const sinon = require('sinon');
const Promise = require('bluebird');
chai.use(require('chai-as-promised'));
chai.should();

const Serializer = require('./../../lib/serializer');

describe('serializer', () => {
  describe('#Serializer', () => {
    it('should return a serializer instance with correct default options', () => {
      const serializer = new Serializer();
      serializer.should.be.instanceof(Serializer);
      serializer.should.be.an('object').with.property('opts');
      serializer.opts.should.be.empty;
      serializer.should.have.property('last');
    });

    it('should return a serializer instance with custom opts', () => {
      const serializer = new Serializer({thing: 'stuff'});
      serializer.opts.should.not.be.empty;
    });
  });

  describe('#enqueue', () => {
    it('should return a promise', () => {
      const serializer = new Serializer();
      const func = serializer.enqueue(sinon.spy());
      func.should.be.instanceof(Promise);
      func.should.have.property('then');
    });

    // @todo: might be better to log the failure instead of throwing it?
    it('should throw an error when one promise is rejected', () => {
      const serializer = new Serializer();
      const allThePromises = [
        serializer.enqueue(() => Promise.resolve('your love')),
        serializer.enqueue(() => Promise.reject(new Error('bad medicine'))),
        serializer.enqueue(() => Promise.resolve('what i need')),
      ];
      return Promise.all(allThePromises).should.eventually.be.rejected;
    });

    it('should run functions in order queued', () => {
      const serializer = new Serializer();
      const runs = 42;
      const log = [];
      const allThePromises = _.map(_.range(runs), i => serializer.enqueue(() => Promise.delay(_.random(0, 5))
        .then(() => log.push(i))));
      return Promise.all(allThePromises)
      .then(results => {
        results.length.should.equal(runs);
        _.forEach(results, (result, index) => {
          result.should.equal(index + 1);
        });
      });
    });
  });
});
