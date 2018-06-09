/**
 * Tests for plugin system.
 * @file plugins.spec.js
 */

'use strict';

// Setup chai.
const chai = require('chai');
chai.use(require('chai-as-promised'));
chai.should();
const Cli = require('../../lib/cli');
const cli = new Cli();

// This is the file we are testing
describe('cli', function() {
  describe('#arv', () => {
    it('should be the same as yargs.argv', function() {
      return cli.argv().should.deep.equal(require('yargs').argv);
    });
  });
  describe('#parseGlobals', () => {
    it('should check for the presence of global options', function() {
      return cli.parseGlobals(['node', 'lando', 'thing', '-v', 'help'])
        .should.be.an('object').with.property('v', 0);
    });
  });

  describe('#parseToYargs', () => {
    it('should translate options into inquiry objects', function() {

    });

    it('should build a handler', function() {

    });

    it('should pass through the command', function() {

    });

    it('should pass through the description', function() {

    });
  });
});
