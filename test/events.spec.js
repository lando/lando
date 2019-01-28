/**
 * Tests for event system.
 * @file events.spec.js
 */

'use strict';

const _ = require('lodash');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
chai.should();

const AsyncEvents = require('../lib/events');

describe('events', () => {
  describe('#AsyncEvents', () => {
    it('should return an events instance with correct default options', () => {
      const events = new AsyncEvents();
      events.should.be.instanceof(AsyncEvents);
      events.should.be.an('object').with.property('log');
      events.should.have.property('_maxListeners', 64);
      events._listeners.should.be.an('array').and.be.empty;
      events.should.have.property('_eventsCount', 0);
    });

    it('should return an events instance with custom log option', () => {
      const log = sinon.spy();
      const events = new AsyncEvents(log);
      events.should.have.property('log', log);
    });
  });

  describe('#on', () => {
    it('should run events without priority at priority 5', () => {
      const events = new AsyncEvents();
      const same1 = sinon.spy();
      const same2 = sinon.spy();
      events.on('event', same1);
      events.on('event', same2);
      const priorityFiveEvents = _(events._listeners)
        .filter(event => event.name === 'event')
        .filter(event => event.priority === 5)
        .size();
      priorityFiveEvents.should.equal(2);
    });

    it('should run events in priority from lowest to highest', () => {
      const events = new AsyncEvents();
      const before = sinon.spy();
      const middle = sinon.spy();
      const after = sinon.spy();
      events.on('event', 4, before);
      events.on('event', middle);
      events.on('event', 6, after);
      events.emit('event').then(() => {
        before.should.be.calledBefore(middle);
        middle.should.be.calledBefore(after);
        after.should.be.calledAfter(middle);
      });
    });
  });

  describe('#emit', () => {
    it('should return a promise', () => {
      const events = new AsyncEvents();
      events.emit('testEvent').should.have.property('then');
    });

    it('should pass optional data from emit into on', () => {
      const data = {maneuver: 'little'};
      const events = new AsyncEvents();
      events.on('battle-of-tanaab', data => {
        data.maneuver.should.equal('little');
        data.should.not.be.empty;
      });
      events.emit('battle-of-tanaab', data);
    });
  });
});
