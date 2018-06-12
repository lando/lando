/**
 * Tests for cache system.
 * @file cache.spec.js
 */

'use strict';

const _ = require('lodash');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const filesystem = require('mock-fs');
const fs = require('fs');
const NodeCache = require('node-cache');
chai.should();

const Cache = require('./../../lib/cache');

describe('cache', () => {
  describe('#Cache', () => {
    it('should return a cache instance with correct default options', () => {
      const cache = new Cache();
      cache.should.be.instanceof(Cache);
      cache.should.be.an('object').with.property('options');
      cache.options.should.have.property('stdTTL', 0);
      cache.options.should.have.property('checkperiod', 600);
      cache.options.should.have.property('errorOnMissing', false);
      cache.options.should.have.property('useClones', true);
      cache.options.should.have.property('deleteOnExpire', true);
    });

    it('should return a cache instance with custom log option', () => {
      const log = sinon.spy();
      const cache = new Cache({log: log});
      cache.should.have.deep.property('log', log);
    });

    it('should return a cache instance with custom cachedir option', () => {
      filesystem();

      const cache = new Cache({cacheDir: '/tmp/cache'});
      cache.should.have.property('cacheDir', '/tmp/cache');

      filesystem.restore();
    });

    it('should create the cache directory', () => {
      filesystem();

      const cache = new Cache({cacheDir: '/tmp/cache'});
      cache.should.have.property('cacheDir', '/tmp/cache');
      fs.existsSync('/tmp/cache').should.be.true;

      filesystem.restore();
    });
  });

  describe('#__get', () => {
    it('should be the same as new NodeCache().get', () => {
      filesystem();

      const cache = new Cache();
      cache.set('yyz', 'amazing');

      const nCache = new NodeCache();
      nCache.set('yyz', 'amazing');

      cache.__get('yyz').should.eql(nCache.get('yyz'));

      filesystem.restore();
    });
  });

  describe('#__set', () => {
    it('should be the same as new NodeCache().set', () => {
      filesystem();

      const cache = new Cache();
      const nCache = new NodeCache();
      cache.__set('yyz', 'amazing').should.eql(nCache.set('yyz', 'amazing'));

      filesystem.restore();
    });
  });

  describe('#__del', () => {
    it('should be the same as new NodeCache().del', () => {
      filesystem();

      const cache = new Cache();
      const nCache = new NodeCache();
      cache.__set('yyz', 'amazing');
      const returnone = cache.__del('yyz');
      nCache.set('yyz', 'amazing');
      const returntwo = nCache.del('yyz');

      returnone.should.eql(returntwo);

      filesystem.restore();
    });
  });

  describe('#set', () => {
    it('should set a cached key in memory', () => {
      filesystem();

      const cache = new Cache({cacheDir: '/tmp/cache'});
      cache.set('yyz', 'amazing');
      fs.existsSync('/tmp/cache/yyz').should.be.false;

      filesystem.restore();
    });

    it('should log a failure when key cannot be cached in memory', () => {
      const cache = new Cache({log: {debug: sinon.spy()}});
      sinon.stub(cache, '__set').returns(false);
      cache.set('test', 'thing');
      const call = cache.log.debug.getCall(0);
      expect(_.includes(call.args[0], 'Failed')).to.equal(true);
      cache.log.debug.callCount.should.equal(1);
    });

    it('should remove a cached key in memory after ttl has expired', () => {
      filesystem();
      const clock = sinon.useFakeTimers();

      const cache = new Cache();

      cache.set('yyz', 'amazing', {ttl: 1});
      expect(cache.get('yyz')).to.eql('amazing');

      clock.tick(1500);

      expect(cache.get('yyz')).to.be.undefined;
      clock.restore();
      filesystem.restore();
    });

    it('should set a cached key in a file if persist is set', () => {
      filesystem();
      const cache = new Cache({cacheDir: '/tmp/cache'});
      cache.set('yyz', 'amazing', {persist: true});
      fs.existsSync('/tmp/cache/yyz').should.be.true;
      filesystem.restore();
    });

    it('should throw an error for unsafe cache keys', () => {
      const cache = new Cache();
      expect(() => cache.set('yyz:amazing', 'alltime')).to.throw('Invalid cache key');
    });
  });

  describe('#get', () => {
    it('should return a cached key from memory', () => {
      const cache = new Cache();
      cache.set('best_drummer', 'Neal Peart');
      cache.get('best_drummer').should.eql('Neal Peart');
    });

    it('should fail to return a cached key from memory if ttl is expired', () => {
      filesystem();
      const clock = sinon.useFakeTimers();

      const cache = new Cache();

      cache.set('yyz', 'amazing', {ttl: 1});
      expect(cache.get('yyz')).to.eql('amazing');

      clock.tick(1500);

      expect(cache.get('yyz')).to.be.undefined;
      clock.restore();
      filesystem.restore();
    });

    it('should return a cached key from file if persists is set', () => {
      filesystem();
      const cache = new Cache({cacheDir: '/tmp/cache'});
      cache.set('yyz', 'amazing', {persist: true});
      cache.get('yyz').should.eql('amazing');
      filesystem.restore();
    });

    it('should return undefined when grabbing an unset key', () => {
      // Get the result of a key that has not been set
      const cache = new Cache();
      // What were you expecting?
      expect(cache.get('BOGUSKEY-I-LOVE-NICK3LBACK-4-LYF')).to.be.undefined;
    });
  });

  describe('#remove', () => {
    it('should remove a cached key from memory', () => {
      const cache = new Cache();
      cache.set('limelight', 'universal dream');
      cache.get('limelight').should.eql('universal dream');

      cache.remove('limelight');
      expect(cache.get('limelight')).to.be.undefined;
    });

    it('should remove file for cached key if it was persistent', () => {
      filesystem();
      const cache = new Cache({cacheDir: '/tmp/cache/'});
      cache.set(
        'subdivisions',
        'Sprawling on the fringes of the city',
        {persist: true}
      );

      fs.existsSync('/tmp/cache/subdivisions').should.be.true;
      cache.remove('subdivisions');

      fs.existsSync('/tmp/cache/subdivisions').should.be.false;
      filesystem.restore();
    });

    it('should log a failure when key cannot be removed from memory', () => {
      const cache = new Cache({log: {debug: sinon.spy()}});
      sinon.stub(cache, '__del').returns(false);
      cache.remove('test');
      const call = cache.log.debug.getCall(0);
      expect(_.includes(call.args[0], 'Failed')).to.equal(true);
      cache.log.debug.callCount.should.equal(2);
    });
  });
});
