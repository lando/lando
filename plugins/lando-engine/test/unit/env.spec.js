/*
 * Tests for lando-plugin:env.
 * @file env.spec.js
 */

'use strict';

// Setup chai.
const chai = require('chai');
const expect = chai.expect;
const filesystem = require('mock-fs');
chai.should();

// Save the original process.platform
const originalPlatform = process.platform;

// Helpers to manage process.platform hijacking
const setPlatform = function(platform) {
  Object.defineProperty(process, 'platform', {value: platform});
};
const resetPlatform = function() {
  Object.defineProperty(process, 'platform', {value: originalPlatform});
};

// Get env module to test
const env = require('./../../lib/env');

// This is the file we are testing
describe('lando-engine.env', function() {

  // This is the method:os we are testing
  describe('#buildDockerCmd:win32', function() {

    // Set process.platform and windows envvars
    before(function() {
      setPlatform('win32');
      process.env.ProgramW6432 = 'C:\\Program Files';
    });

    it('should return correct command on win32', function() {

      // Get the command
      const cmd = env.buildDockerCmd();

      // Assert the things
      expect(cmd).to.have.length(3);
      expect(cmd[0]).to.equal('cmd');
      expect(cmd[1]).to.equal('/C');
      expect(cmd[2]).to.equal(process.env.ProgramW6432 + '\\Docker\\Docker\\Docker for Windows.exe');

    });

    // Restore process.platform
    after(function() {
      resetPlatform();
      delete process.env.ProgramW6432;
    });

  });

  // This is the method:os we are testing
  describe('#buildDockerCmd:darwin', function() {

    // Set process.platform
    before(function() {
      setPlatform('darwin');
    });

    it('should return correct command on darwin', function() {

      // Get the command
      const cmd = env.buildDockerCmd();
      expect(cmd).to.have.length(2);
      expect(cmd[0]).to.equal('open');

      // Assert the things
      expect(cmd[1]).to.equal('/Applications/Docker.app');

    });

    // Restore process.platform
    after(function() {
      resetPlatform();
    });

  });

  // This is the method:os we are testing
  describe('#buildDockerCmd:linux', function() {

    // Set process.platform
    before(function() {
      setPlatform('linux');
    });

    it('should return systemctl command if possible', function() {

      // Mock out both process.env.PATH and an FS
      process.env.PATH = '/bin';
      filesystem({'/bin/systemctl': 'CODEZ'});

      // Get the command
      const operation = 'start';
      const cmd = env.buildDockerCmd(operation);

      // Assert the things
      expect(cmd).to.have.length(4);
      expect(cmd[0]).to.equal('sudo');
      expect(cmd[1]).to.equal('systemctl');
      expect(cmd[2]).to.equal(operation);
      expect(cmd[3]).to.equal('docker');

      // Restore to real FS
      filesystem.restore();

    });

    it('should otherwise return services command on linux as fallback', function() {

      // This ensures that shell.which will always be null
      delete process.env.PATH;
      filesystem({'/bin/systemctl': 'CODEZ'});

      // Get the command
      const operation = 'start';
      const cmd = env.buildDockerCmd(operation);

      // Assert the things
      expect(cmd).to.have.length(4);
      expect(cmd[0]).to.equal('sudo');
      expect(cmd[1]).to.equal('service');
      expect(cmd[2]).to.equal('docker');
      expect(cmd[3]).to.equal(operation);

    });

    // Restore process.platform
    after(function() {
      resetPlatform();
    });

  });

});
