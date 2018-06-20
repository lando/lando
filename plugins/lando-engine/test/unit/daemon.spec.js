/*
 * Tests for lando-engine:daemon.
 * @file daemon.spec.js
 */

'use strict';

// Setup chai.
// const chai = require('chai');
// const expect = chai.expect;
// chai.should();

describe('lando-engine.daemon', () => {
  describe('#LandoDaemon', () => {
    it('should return an instance with the correct defaults');
    it('should set this with the correct things');
  });

  describe('#up', () => {
    // Using a sinon stub or spy on core EventEmitter is probably fine here
    it('should emit a pre and post engine-up events');

    // @note: probably worth looking at our other tests for platform spoofing goodness
    // @todo: get ^ goodness in some unit test helper module so we dont keep dedoing it on a per-file basis
    it('should resolve with truth if the context is not node and we are on linux');

    // @note: mock-fs is probably the way to go here
    it('should throw an error if this.docker is not in the PATH somewhere');
    it('should attempt to start docker if its not up');
    it('should throw an error if it cannot start docker');
  });

  describe('#down', () => {
    it('should resolve with truth if the context is not node and we are on linux');
    it('should resolve with truth if we are on win32 or darwin');
    it('should try to stop docker if its already up');
    it('should throw an error if it cant shut down docker');
  });
});
