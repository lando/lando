/**
 * Tests for user module.
 * @file user.spec.js
 */

'use strict';

// Setup chai.
const chai = require('chai');
const expect = chai.expect;
chai.should();

// Save the original process.platform
const originalPlatform = process.platform;

// Helpers to manage process.platform hijacking
const setPlatform = function(platform) {
  Object.defineProperty(process, 'platform', {value: platform});
};
const resetPlatform = function() {
  Object.defineProperty(process, 'platform', {value: originalPlatform});
};

// Get yaml module to test
const user = require('./../../lib/user');

// This is the file we are testing
describe('user', () => {

  describe('#getUid', () => {

    it('returns user 1000 on Windows', () => {

      // Spoof windows
      setPlatform('win32');

      // Get the uid
      const uid = user.getUid();

      // Assert things
      expect(uid).to.equal('1000');
      expect(uid).to.be.a('string');
      expect(isFinite(uid)).to.equal(true);

      // Reset platform
      resetPlatform();

    });

    it('returns a uid when no argument is specified', () => {

      // Get the uid
      const uid = user.getUid();

      // Assert things
      expect(uid).to.be.a('string');
      expect(isFinite(uid)).to.equal(true);

    });

    it('returns a uid for username', () => {

      // Get the uid
      const uid = user.getUid('root');

      // Assert things
      expect(uid).to.be.a('string');
      expect(isFinite(uid)).to.equal(true);

    });

    it('returns uid as a string', () => {

      // Get the uid
      const uid = user.getUid();

      // Assert things
      expect(uid).to.be.a('string');

    });

    it('throws an error for a bogus user on POSIX', () => {
      if (process.platform === 'win32') {
        expect(() => user.getUid('gandalflandokenobi5000')).to.not.throw(Error);
      }
      else {
        expect(() => user.getUid('gandalflandokenobi5000')).to.throw(Error);
      }
    });

  });

  describe('#getGid', () => {

    it('returns group 1000 on Windows', () => {

      // Spoof windows
      setPlatform('win32');

      // Get the gid
      const gid = user.getGid();

      // Assert things
      expect(gid).to.equal('1000');
      expect(gid).to.be.a('string');
      expect(isFinite(gid)).to.equal(true);

      // Reset platform
      resetPlatform();

    });

    it('returns a gid when no argument is specified', () => {

      // Get the gid
      const gid = user.getGid();

      // Assert things
      expect(gid).to.be.a('string');
      expect(isFinite(gid)).to.equal(true);

    });

    it('returns a gid for username', () => {

      // Get the gid
      const gid = user.getGid('root');

      // Assert things
      expect(gid).to.be.a('string');
      expect(isFinite(gid)).to.equal(true);

    });

    it('returns gid as a string', () => {

      // Get the gid
      const gid = user.getGid();

      // Assert things
      expect(gid).to.be.a('string');

    });

    it('throws an error for a bogus user on POSIX', () => {
      if (process.platform === 'win32') {
        expect(() => user.getGid('gandalflandokenobi5000')).to.not.throw(Error);
      }
      else {
        expect(() => user.getGid('gandalflandokenobi5000')).to.throw(Error);
      }
    });


  });

});
