'use strict';

const CliTest = require('command-line-test');
const path = require('path');

describe('Tooling Commands', function() {
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
    it('Allows for SSH commands within containers');
    it('Allows user to define commands to run in any service');
  });
});
