'use strict';

const CliTest = require('command-line-test');
const path = require('path');

describe('Init Commands', function() {
  // Use the entry-point in the app, not the globally installed Lando.
  this.executable = path.resolve(
    __dirname, '..', '..', '..', '..', '..', 'bin', 'lando.js'
  );

  // Get a fresh CLI command object before each test.
  beforeEach(function() {
    // We'll need this in all tests
    this.cliTest = new CliTest();
  });

  describe('#init', function() {
    it('creates a lando file');
    it('asks the user for a recipe');
    it('accepts a recipe as an option');
    it('accepts a method as an argument');
    it('accepts a name as an option');
    it('accepts a webroot as an option');
    it('accepts a destination as an option');
    it('allows automatic yes to all prompts');
  });
});
