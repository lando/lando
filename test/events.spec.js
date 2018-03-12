/**
* Tests for event system.
* @file events.spec.js
*/

'use strict';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

const Events = require('../lib/events');
describe('events', function () {
  before(function() {
    this.events = new Events();
  });

  describe('#on', function() {
    it('allows overriding priorities', function() {
      const spy1 = sinon.spy();
      const spy2 = sinon.spy();

      this.events.on('eventOne', 1, spy1);
      this.events.on('eventOne', 2, spy2);
      this.events.emit('eventOne').then((result) => {
        spy1.should.have.been.calledBefore(spy2);
      });

      this.events.on('eventTwo', 2, spy1);
      this.events.on('eventTwo', 1, spy2);
      this.events.emit('eventTwo').then((result) => {
        spy2.should.be.calledBefore(spy1);
      });
    });
  });

  describe('#emit', () => {
    it('blocks for callback completion');

    it('returns a promise', function() {
      // @todo: is this a legit way to test for a promise?
      this.events.emit('testEvent').should.have.property('then');
    });

  });
});
