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

const user = require('./../lib/user');

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


    it('should return uid as a string', () => {
      const uid = user.getUid();
      expect(uid).to.be.a('string');
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


    it('should return gid as a string', () => {
      const gid = user.getGid();
      expect(gid).to.be.a('string');
    });
  });

  describe('#getUsername', () => {
    it('should return a string', () => {
      const username = user.getUsername();
      expect(username).to.be.a('string');
      expect(username).to.not.be.empty;
    });
  });
});
