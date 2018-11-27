/*
 * Tests for lando-engine:router.
 * @file router.spec.js
 */

'use strict';

// Setup chai.
const chai = require('chai');
chai.use(require('chai-events'));
chai.should();

const Daemon = require('./../lib/daemon');
const daemon = new Daemon();
const Events = require('./../../../lib/events');
const events = new Events();
const Promise = require('./../../../lib/promise');
const router = require('./../lib/router');
const sinon = require('sinon');

describe('lando-engine.router', () => {
  // @note: we should loop through all the funcs that use retryEach to verify a few things
  it('build, destroy, logs, start and stop can handle data being an object or array of objects');
  describe('#engineCmd', () => {
    it('should ensure that daemon.up runs first', () => {
      const upStub = sinon.stub(daemon, 'up')
        .usingPromise(Promise)
        .resolves(true);

      const eventStub = sinon.stub(events, 'emit')
        .usingPromise(Promise)
        .resolves(true);

      return router.engineCmd(
        'Solo',
        daemon,
        events,
        '',
        data => {}
      )
      .then(() => {
        upStub.should.be.calledBefore(eventStub);
        upStub.restore();
        return eventStub.restore();
      });
    });

    it('should emit correctly named pre and post events with data');
    /* , () => {
      return router.engineCmd('Chewie', daemon, events, '', data => {})
      .then(() => {
        events.should.emit('pre-engine-Chewie');
        events.should.emit('post-engine-Chewie');
      });
    });
    */

    it('should run the run function in between the two events');
    /* , () => {
      const spy1 = sinon.spy();
      const spy2 = sinon.spy();
      const spy3 = sinon.spy();
      events.on('pre-engine-elthree', spy2);
      events.on('post-engine-elthree', spy3);
      return router.engineCmd('elthree', daemon, events, '', spy1)
      .then(() => {
        spy1.should.be.calledAfter(spy2);
        return spy1.should.be.calledBefore(spy3);
      });
    });
    */

    it('should return a Promise containing the result of the run function');
    /* , () => {
      const stub = sinon.stub().returns('Human cyborg relations');
      return router.engineCmd('3PO', daemon, events, '', stub)
      .then(res => {
        return res.should.equal('Human cyborg relations');
      });
    });
    */
  });

  describe('#build', () => {
    it('should run compose.pull and then compose.build on each datum');
  });

  describe('#destroy', () => {
    it('should run compose.remove if datum is a compose object');
    it('should run docker.remove if not a compose object');
  });

  describe('#exists', () => {
    it('should run compose.getId if datum is a compose object and return true if it finds something');
    it('should run docker.list if not a compose object and return true if it finds our id');
  });

  describe('#logs', () => {
    it('should run compose.logs on each datum');
  });

  describe('#run', () => {
    it('should run on each datum in data if data is an array');
    it('should start target container if its not running');
    it('should correctly merge options and use compose.run on windoze');
    it('should use docker.run on posix');
    it('should stop the target container if we had to start it previously');
    it('should destroy the target container if autoRemove is true');
  });

  describe('#scan', () => {
    it('should docker.inspect the first id it finds if data.compose is set');
    it('should otherwise just run docker.inspect');
  });

  describe('#start', () => {
    it('should run compose.start on each datum');
  });

  describe('#stop', () => {
    it('should run compose.stop on each datum that is a compose object');
    it('should otherwise run docker.stop');
  });
});
