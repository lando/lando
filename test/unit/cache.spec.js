/**
 * Tests for cache system.
 * @file cache.spec.js
 */

'use strict';

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
    it('returns a cache instance with correct default options', () => {
      const cache = new Cache();
      cache.should.be.instanceof(Cache);
      cache.should.be.an('object').with.property('options');
      cache.options.should.have.property('stdTTL', 0);
      cache.options.should.have.property('checkperiod', 600);
      cache.options.should.have.property('errorOnMissing', false);
      cache.options.should.have.property('useClones', true);
      cache.options.should.have.property('deleteOnExpire', true);
    });

    it('returns a cache instance with custom log option', () => {
      const log = sinon.spy();
      const cache = new Cache({log: log});
      cache.should.have.deep.property('log', log);
    });

    it('returns a cache instance with custom cachedir option', () => {
      filesystem();

      const cache = new Cache({cacheDir: '/tmp/cache'});
      cache.should.have.property('cacheDir', '/tmp/cache');

      filesystem.restore();
    });

    it('sets up the cache directory', () => {
      filesystem();

      const cache = new Cache({cacheDir: '/tmp/cache'});
      cache.should.have.property('cacheDir', '/tmp/cache');
      fs.existsSync('/tmp/cache').should.be.true;

      filesystem.restore();
    });
  });

  describe('#__get', () => {
    it('is the same as new NodeCache().get', () => {
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
    it('is the same as new NodeCache().set', () => {
      filesystem();

      const cache = new Cache();
      const nCache = new NodeCache();
      cache.__set('yyz', 'amazing').should.eql(nCache.set('yyz', 'amazing'));

      filesystem.restore();
    });
  });

  describe('#__del', () => {
    it('is the same as new NodeCache().del', () => {
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
    it('sets a cached key in memory', () => {
      filesystem();

      const cache = new Cache({cacheDir: '/tmp/cache'});
      cache.set('yyz', 'amazing');
      fs.existsSync('/tmp/cache/yyz').should.be.false;

      filesystem.restore();
    });

    it('destroys a cached key in memory after ttl has expired', () => {
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

    it('sets a cached key in a file if persist is set', () => {
      filesystem();
      const cache = new Cache({cacheDir: '/tmp/cache'});
      cache.set('yyz', 'amazing', {persist: true});
      fs.existsSync('/tmp/cache/yyz').should.be.true;
      filesystem.restore();
    });

    it('throw an error for unsafe cache keys', () => {
      const cache = new Cache();
      expect(() => cache.set('yyz:amazing', 'alltime'))
        .to.throw('Invalid cache key');
    });
  });

  describe('#get', () => {
    it('returns a cached key from memory', () => {
      const cache = new Cache();
      cache.set('best_drummer', 'Neal Peart');
      cache.get('best_drummer').should.eql('Neal Peart');
    });

    it('fails to return a cached key from memory if ttl is expired', () => {
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

    it('returns a cached key from file if persists is set', () => {
      filesystem();
      const cache = new Cache({cacheDir: '/tmp/cache'});
      cache.set('yyz', 'amazing', {persist: true});
      cache.get('yyz').should.eql('amazing');
      filesystem.restore();
    });

    it('returns undefined when grabbing an unset key', () => {
      // Get the result of a key that has not been set
      const cache = new Cache();
      // What were you expecting?
      expect(cache.get('BOGUSKEY-I-LOVE-NICK3LBACK-4-LYF')).to.be.undefined;
    });
  });

  describe('#remove', () => {
    it('removes a cached key from memory', () => {
      const cache = new Cache();
      cache.set('limelight', 'universal dream');
      cache.get('limelight').should.eql('universal dream');

      cache.remove('limelight');
      expect(cache.get('limelight')).to.be.undefined;
    });

    it('removes a cached key from file', () => {
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
  });
});
