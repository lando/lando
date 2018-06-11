/**
 * Tests for user module.
 * @file user.spec.js
 */

'use strict';

const chai = require('chai');
const expect = chai.expect;
const originalPlatform = process.platform;
chai.should();

const setPlatform = function(platform) {
  Object.defineProperty(process, 'platform', {value: platform});
};
const resetPlatform = function() {
  Object.defineProperty(process, 'platform', {value: originalPlatform});
};

const user = require('./../../lib/user');

// @todo: we need to actually stub out shell-exec because this relies on OS specific things like `id`
describe('user', () => {
  describe('#getUid', () => {
    it('should return user 1000 on Windows', () => {
      setPlatform('win32');
      const uid = user.getUid();
      expect(uid).to.equal('1000');
      expect(uid).to.be.a('string');
      expect(isFinite(uid)).to.equal(true);
      resetPlatform();
    });

    it('should return a uid when no argument is specified', () => {
      const uid = user.getUid();
      expect(uid).to.be.a('string');
      expect(isFinite(uid)).to.equal(true);
    });

    it('should return a uid for username', () => {
      const uid = user.getUid('root');
      expect(uid).to.be.a('string');
      expect(isFinite(uid)).to.equal(true);
    });

    it('should return uid as a string', () => {
      const uid = user.getUid();
      expect(uid).to.be.a('string');
    });

    it('should throw an error for a bogus user on POSIX', () => {
      if (process.platform === 'win32') {
        expect(() => user.getUid('gandalflandokenobi5000')).to.not.throw(Error);
      } else {
        expect(() => user.getUid('gandalflandokenobi5000')).to.throw(Error);
      }
    });
  });

  describe('#getGid', () => {
    it('should return group 1000 on Windows', () => {
      setPlatform('win32');
      const gid = user.getGid();
      expect(gid).to.equal('1000');
      expect(gid).to.be.a('string');
      expect(isFinite(gid)).to.equal(true);
      resetPlatform();
    });

    it('should return a gid when no argument is specified', () => {
      const gid = user.getGid();
      expect(gid).to.be.a('string');
      expect(isFinite(gid)).to.equal(true);
    });

    it('should return a gid for username', () => {
      const gid = user.getGid('root');
      expect(gid).to.be.a('string');
      expect(isFinite(gid)).to.equal(true);
    });

    it('should return gid as a string', () => {
      const gid = user.getGid();
      expect(gid).to.be.a('string');
    });

    it('should throw an error for a bogus user on POSIX', () => {
      if (process.platform === 'win32') {
        expect(() => user.getGid('gandalflandokenobi5000')).to.not.throw(Error);
      } else {
        expect(() => user.getGid('gandalflandokenobi5000')).to.throw(Error);
      }
    });
  });
});
