/*
 * Tests for lando-events:utils.
 * @file utils.spec.js
 */

'use strict';

// Setup chai.
// const chai = require('chai');
// const expect = chai.expect;
// chai.should();

describe('lando-events.utils', () => {
  describe('#events2Runz', () => {
    it('should run on the user indicated service if the cmd is written as {service: cmd}');
    it('should use the service on the event data or appserver if the service is not explicitly written');
    it('should throw an error if the service doesnt exist on the app');
    it('should return an array of objects that can be fed to lando.engine.run');
  });
});
