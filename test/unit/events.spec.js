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

// Get the module we want to test
const AsyncEvents = require('../../lib/events');

// OK.... KICK IT!
describe('events', () => {

  // Constructor things
  describe('#AsyncEvents', () => {

    // Test defaults
    it('returns an events instance with correct default options', () => {
      const events = new AsyncEvents();
      events.should.be.an('object').with.property('log');
      events.should.have.property('_maxListeners', 20);
      events._listeners.should.be.an('array').and.be.empty;
      events.should.have.property('_eventsCount', 0);
    });

    // Custom logger
    it('returns an events instance with custom log option', () => {
      const log = sinon.spy();
      const events = new AsyncEvents(log);
      events.should.have.property('log', log);
    });

  });

  describe('#on', () => {

    // Test the defaults
    it('runs events without priority at priority 5', () => {

      // Summon events
      const events = new AsyncEvents();

      // Grab our spies
      const same1 = sinon.spy();
      const same2 = sinon.spy();

      // Queue up our events
      events.on('event', same1);
      events.on('event', same2);

      // Get amount of priority 5 events
      const priorityFiveEvents = _(events._listeners)
        // Filter by name
        .filter(event => event.name === 'event')
        // Filter by priority
        .filter(event => event.priority === 5)
        // Get value
        .size();

      // Verify priority five events
      priorityFiveEvents.should.equal(2);

    });

    // Tests priorities
    it('runs events in priority from lowest to highest', function() {

      // Summon events
      const events = new AsyncEvents();

      // Grab our spies
      const before = sinon.spy();
      const middle = sinon.spy();
      const after = sinon.spy();

      // Queue up our events
      events.on('event', 4, before);
      events.on('event', middle);
      events.on('event', 6, after);

      // Check event run order
      events.emit('event').then(() => {
        before.should.be.calledBefore(middle);
        middle.should.be.calledBefore(after);
        after.should.be.calledAfter(middle);
      });

    });
  });

  describe('#emit', function() {

    it('returns a promise', function() {
      const events = new AsyncEvents();
      // @todo: is this a legit way to test for a promise?
      events.emit('testEvent').should.have.property('then');
    });

  });
});
