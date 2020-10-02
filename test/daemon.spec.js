/*
 * Tests for daemon.
 * @file daemon.spec.js
 */

'use strict';

// Setup chai.
const chai = require('chai');
chai.use(require('chai-events'));
chai.should();
// const sinon = require('sinon');

const Daemon = require('./../lib/daemon');
const env = require('./../lib/env');
const Log = require('./../lib/logger');

describe('daemon', () => {
  describe('#LandoDaemon', () => {
    it('should return an instance with the correct defaults', () => {
      const daemon = new Daemon();

      daemon.docker.should.equal(env.getDockerExecutable());
      daemon.log.should.be.instanceOf(Log);
      return daemon.context.should.equal('node');
    });

    // @todo this seems like a dupe of the above...
    it('should set this with the correct things');
  });

  describe('#up', () => {
    // Using a sinon stub or spy on core EventEmitter is probably fine here
    it('should emit a pre and post engine-up events'); /*
    @todo: below messes up the scan.spec for some reason so commenting out for now
    () => {
      const daemon = new Daemon();
      const isUpStub = sinon.stub(daemon, 'isUp').resolves(true);

      daemon.up().then(() => {
        daemon.events.should.emit('pre-engine-up');
        daemon.events.should.emit('post-engine-up');
        isUpStub.restore();
      });
    });
    */

    // @note: probably worth looking at our other tests for platform spoofing goodness
    // @todo: get ^ goodness in some unit test helper module so we don't keep dedoing it on a per-file basis
    it('should resolve with truth if the context is not node and we are on linux');
    /* , () => {
      // Force process.platform to Linux
      helper.setPlatform('linux');

      // Set up the daemon.
      const daemon = new Daemon(
          new Cache(),
          new Events(),
          env.getDockerExecutable(),
          new Log(),
          'magic-context'
      );

      return daemon.up().should.eventually.be.true.then(() => {
        return helper.resetPlatform();
      });
    });
    */

    it('should attempt to start docker if its not up');
    /* , () => {
      const daemon = new Daemon();
      const isUpStub = sinon.stub(daemon, 'isUp')
        .usingPromise(Promise).resolves(false);

      const shellStub = sinon.stub(shell, 'sh').resolves(true);
      return daemon.up().then(() => {
        shellStub.should.be.called;
        isUpStub.restore();
        shellStub.restore();
      });
    });
    */

    it('should invoke the docker daemon');
    /* , () => {
      const daemon = new Daemon();
      const shellStub = sinon.stub(shell, 'sh');
      return daemon.up().then(() => {
        shellStub.should.be.calledWith(env.buildDockerCmd('start'));
        return shellStub.restore();
      });
    });
    */

    it('should throw an error if it cannot start docker');
  });

  describe('#down', () => {
    it('should resolve with truth if the context is not node and we are on linux');
    it('should resolve with truth if we are on win32 or darwin');
    it('should try to stop docker if it\'s already up');
    it('should throw an error if it can\'t shut down docker');
  });

  describe('#isUp', () => {
    // @note: mock-fs is probably the way to go here
    it('Should return true if docker is running');
    it('Should return false if docker is not running');
  });
});
