/*
 * Tests for utils.
 * @file utils.spec.js
 */

'use strict';

// Setup chai.
// const chai = require('chai');
// const expect = chai.expect;
// chai.should();

describe('utils', () => {
  describe('#dockerComposify', () => {
    it('should remove _ and - characters');
    it('should return data in lowercase');
  });

  describe('#escSpaces', () => {
    it('should be the same as shell.escSpaces');
  });

  describe('#getId', () => {
    it('should return one of cid, id, containerName, containerId or name in that order');
  });

  describe('#toLandoContainer', () => {
    it('should properly map container labels and return a lando container object');
    it('should set the name to be the docker compose service name');
    it('should add "run" to the service name if this is a onoff container');
    it('should set the appname unless this is a service container');
    it('should set the kind of container to either app or service');
    it('should set lando to true if this is a lando container');
    it('should set an instance id or unknown');
  });

  describe('#moveConfig', () => {
    it('should copy all non *.js files from src to dest');
    it('should create the dest directory if needed');
    it('should attempt to correct any EISDIR errors');
    it('should throw an error on other errors');
    it('should return the destination directory');
  });

  describe('#runConfig', () => {
    it('should force collect mode when process.lando is not node');
    it('should prefix any opts.pre to cmd');
    it('should correctly set our execOpts and startOpts based on user args and defaults');
  });

  describe('#runStream', () => {
    it('should pipe the stream into process.stdout');
    it('should also correctly attach to stdin id attached is true');
    it('should collect stdout and stderr correctly and translate them to strings');
    it('should correctly detach stdin then the stream ends');
    it('should return a promise that resolves with an object of stdout and stderr');
  });
});
