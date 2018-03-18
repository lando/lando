/**
* Tests for event system.
* @file events.spec.js
*/

'use strict';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
chai.should();

const Events = require('../../lib/events');
describe('events', function () {
  var events = new Events();

  describe('#on', function() {
    it('allows overriding priorities', function() {
      const spy1 = sinon.spy();
      const spy2 = sinon.spy();

      events.on('eventOne', 1, spy1);
      events.on('eventOne', 2, spy2);
      events.emit('eventOne').then(function() {
        spy1.should.have.been.calledBefore(spy2);
      }).then(function() {
        events.on('eventTwo', 2, spy1);
        events.on('eventTwo', 1, spy2);
        events.emit('eventTwo').then(function() {
          spy2.should.be.calledBefore(spy1);
        });
      });

    });
  });

  describe('#emit', function() {
    it('blocks for callback completion');

    it('returns a promise', function() {
      // @todo: is this a legit way to test for a promise?
      events.emit('testEvent').should.have.property('then');
    });

  });
});
