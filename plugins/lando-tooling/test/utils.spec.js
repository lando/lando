/*
 * Tests for lando-tooling:utils.
 * @file utils.spec.js
 */

'use strict';

// Setup chai.
// const chai = require('chai');
// const expect = chai.expect;
// chai.should();

describe('lando-tooling.utils', () => {
  describe('#buildCommand', () => {
    it('should return with a correctly set container id');
    it('should return with a correctly set array of compose files');
    it('should return with a correctly set project name');
    it('should return with a correct string command');
    it('should return an app object option');
    it('should return a pre option that cds to a directory');
    it('should return with a valid user');
    it('should return an array of services with no empty elements');
  });

  describe('#getContainer', () => {
    it('should return the value of the --OPTION as the service to use when the service is defined as :OPTION');
    it('should otherwise return back the unaltered service');
  });

  describe('#getContainerPath', () => {
    it('should return $LANDO_MOUNT if you are in the same directory as appRoot');
    it('should return $LANDO_MOUNT appended with POSIX path separated directories if you have traversed below appRoot');
    it('should return $LANDO_MOUNT appended with any directories from where you are up to appRoot');
  });

  describe('#getOpts', () => {
    it('should use process.arvg with first three elements dropped by default');
    it('should return argv without and global options eg -- and everything after it');
  });

  describe('#getPassthruOpts', () => {
    it('should filter out any non-passthrough options');
    it('should return an array of "--OPTION ANSWER" pairs');
  });

  describe('#parseCommand', () => {
    it('should handle either a cmd that is either a string or array');
    it('should handle when command is a string or object');
    it('should parse command into a string');
    it('should set container from command when it is an object else fallback to service');
    it('should return an array of objects');
  });

  describe('#runCommands', () => {
    it('should emit pre and post events in the form pre-NAME and post-NAME');
    it('should throw an error if any cmds fails');
    it('should inject an object into the events');
  });

  describe('#toolingDefaults', () => {
    it('should correctly return defaults');
    it('should correctly return with defined args');
  });
});
