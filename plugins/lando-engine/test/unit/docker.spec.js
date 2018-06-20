/*
 * Tests for lando-engine:docker.
 * @file docker.spec.js
 */

'use strict';

// Setup chai.
// const chai = require('chai');
// const expect = chai.expect;
// chai.should();

describe('lando-engine.docker', () => {
  describe('#Landerode', () => {
    it('should inherit things from Dockerode');
  });

  describe('#createNetwork', () => {
    it('should merge name correctly into opts');
    it('should throw an error if cant create network');
  });

  describe('#inspect', () => {
    it('should throw an error if inspect fails');
  });

  describe('#isRunning', () => {
    it('should return boolean based on State.Running inspect data or false if none');
    it('should return false if container doesnt exist');
    it('should throw an error on all other catches');
  });

  describe('#list', () => {
    it('should filter out any containers that are pending removal');
    it('should remove any "null" containers');
    it('should filter out non-lando containers');
    it('should filter by appName if given');
    it('should throw an error on all other catches');
    it('should return an array of lando containers');
  });

  describe('#remove', () => {
    it('should throw an error if remove fails');
  });

  describe('#run', () => {
    it('should resolve with stdout when error code is 0');
    it('should reject with object containing output and exit code otherwise');
  });
});
