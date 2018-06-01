/*
 * Tests for lando-engine:env.
 * @file env.spec.js
 */

'use strict';

// Setup chai.
const _ = require('lodash');
const chai = require('chai');
const expect = chai.expect;
const filesystem = require('mock-fs');
const path = require('path');
chai.should();

// Save the original process.platform
const originalPlatform = process.platform;

// Helpers to manage process.platform hijacking
const setPlatform = platform => {
  Object.defineProperty(process, 'platform', {value: platform});
};
const resetPlatform = () => {
  Object.defineProperty(process, 'platform', {value: originalPlatform});
};

// Get env module to test
const env = require('./../../lib/env');

// This is the file we are testing
describe('lando-engine.env', () => {

  // This is the method:os we are testing
  describe('#getDockerBinPath:win32', () => {

    // Set process.platform and windows envvars
    before(() => {
      setPlatform('win32');
      process.env.ProgramW6432 = 'C:\\Program Files';
    });

    it('should return the correct lando-provided path on win32', () => {

      // Get the command
      const dockerBinPath = env.getDockerBinPath();

      // Assert the things
      var pf = process.env.ProgramW6432;
      const value = path.win32.join(pf, 'Docker', 'Docker', 'resources', 'bin');
      expect(dockerBinPath).to.equal(value);

    });

    // Restore process.platform
    after(() => {
      resetPlatform();
      delete process.env.ProgramW6432;
    });

  });

  // This is the method:os we are testing
  describe('#getDockerBinPath:linux', () => {

    // Set process.platform and windows envvars
    before(() => {
      setPlatform('linux');
    });

    it('should return the correct lando-provided path on linux', () => {

      // Get the command
      const dockerBinPath = env.getDockerBinPath();

      // Assert the things
      expect(dockerBinPath).to.equal('/usr/share/lando/bin');

    });

    // Restore process.platform
    after(() => {
      resetPlatform();
    });

  });

  // This is the method:os we are testing
  describe('#getDockerBinPath:darwin', () => {

    // Set process.platform and windows envvars
    before(() => {
      setPlatform('darwin');
    });

    it('should return the correct lando-provided path on darwin', () => {

      // Get the command
      const dockerBinPath = env.getDockerBinPath();

      // Assert the things
      expect(dockerBinPath).to.equal('/Applications/Docker.app/Contents/Resources/bin');

    });

    // Restore process.platform
    after(() => {
      resetPlatform();
    });

  });

  // This is the method:os we are testing
  describe('#getComposeExecutable:win32', () => {

    // Set process.platform and windows envvars
    before(() => {
      setPlatform('win32');
      process.env.ProgramW6432 = 'C:\\Program Files';
    });

    it('should return the correct lando-provided path on win32', () => {

      // Get the command
      const composeExecutable = env.getComposeExecutable();

      // Assert the things
      const value = path.win32.join(env.getDockerBinPath(), 'docker-compose.exe');
      expect(composeExecutable).to.equal(value);

    });

    // Restore process.platform
    after(() => {
      resetPlatform();
      delete process.env.ProgramW6432;
    });

  });

  // This is the method:os we are testing
  describe('#getComposeExecutable:linux', () => {

    // Set process.platform and windows envvars
    before(() => {
      setPlatform('linux');
    });

    it('should return the correct lando-provided path on linux', () => {

      // Mock out both process.env.PATH and an FS
      filesystem({'/usr/share/lando/bin/docker-compose': 'CODEZ'});

      // Get the command
      const composeExecutable = env.getComposeExecutable();

      // Assert the things
      expect(composeExecutable).to.equal('/usr/share/lando/bin/docker-compose');

      // Restore to real FS
      filesystem.restore();

    });

    it('should fall back to an in PATH provided path if the lando-provided one does not exist', () => {

      // Mock out both process.env.PATH and an FS
      process.env.PATH = '/usr/local/bin';
      filesystem({'/usr/local/bin/docker-compose': 'CODEZ'});

      // Get the command
      const composeExecutable = env.getComposeExecutable();

      // Assert the things
      expect(_.isString(composeExecutable)).to.equal(true);
      expect(path.parse(composeExecutable)).to.be.an('Object');

      // Restore to real FS
      filesystem.restore();

    });

    // Restore process.platform
    after(() => {
      resetPlatform();
    });

  });

  // This is the method:os we are testing
  describe('#getComposeExecutable:darwin', () => {

    // Set process.platform and windows envvars
    before(() => {
      setPlatform('darwin');
    });

    it('should return the correct lando-provided path on darwin', () => {

      // Get the command
      const composeExecutable = env.getComposeExecutable();

      // Assert the things
      expect(composeExecutable).to.equal('/Applications/Docker.app/Contents/Resources/bin/docker-compose');

    });

    // Restore process.platform
    after(() => {
      resetPlatform();
    });

  });

  // This is the method:os we are testing
  describe('#getDockerExecutable:win32', () => {

    // Set process.platform and windows envvars
    before(() => {
      setPlatform('win32');
      process.env.ProgramW6432 = 'C:\\Program Files';
    });

    it('should return the correct lando-provided path on win32', () => {

      // Get the command
      const composeExecutable = env.getDockerExecutable();

      // Assert the things
      const value = path.win32.join(env.getDockerBinPath(), 'docker.exe');
      expect(composeExecutable).to.equal(value);

    });

    // Restore process.platform
    after(() => {
      resetPlatform();
      delete process.env.ProgramW6432;
    });

  });

  // This is the method:os we are testing
  describe('#getDockerExecutable:linux', () => {

    // Set process.platform and windows envvars
    before(() => {
      setPlatform('linux');
    });

    it('should return the normal system path on linux', () => {

      // Mock out both process.env.PATH and an FS
      filesystem({'/usr/bin/docker': 'CODEZ'});

      // Get the command
      const dockerExecutable = env.getDockerExecutable();

      // Assert the things
      expect(dockerExecutable).to.equal('/usr/bin/docker');

      // Restore to real FS
      filesystem.restore();

    });

    it('should fall back to an in PATH provided path if docker is not in the usual place', () => {

      // Mock out both process.env.PATH and an FS
      process.env.PATH = '/usr/local/bin';
      filesystem({'/usr/local/bin/docker': 'CODEZ'});

      // Get the command
      const dockerExecutable = env.getDockerExecutable();

      // Assert the things
      expect(_.isString(dockerExecutable)).to.equal(true);
      expect(path.parse(dockerExecutable)).to.be.an('Object');
      // Restore to real FS
      filesystem.restore();

    });

    // Restore process.platform
    after(() => {
      resetPlatform();
    });

  });

  // This is the method:os we are testing
  describe('#getDockerExecutable:darwin', () => {

    // Set process.platform and windows envvars
    before(() => {
      setPlatform('darwin');
    });

    it('should return the correct lando-provided path on darwin', () => {

      // Get the command
      const dockerExecutable = env.getDockerExecutable();

      // Assert the things
      expect(dockerExecutable).to.equal('/Applications/Docker.app/Contents/Resources/bin/docker');

    });

    // Restore process.platform
    after(() => {
      resetPlatform();
    });

  });

  // This is the method:os we are testing
  describe('#buildDockerCmd:win32', () => {

    // Set process.platform and windows envvars
    before(() => {
      setPlatform('win32');
      process.env.ProgramW6432 = 'C:\\Program Files';
    });

    it('should return correct command on win32', () => {

      // Get the command
      const cmd = env.buildDockerCmd();

      // Assert the things
      expect(cmd).to.have.length(3);
      expect(cmd[0]).to.equal('cmd');
      expect(cmd[1]).to.equal('/C');
      expect(cmd[2]).to.equal(process.env.ProgramW6432 + '\\Docker\\Docker\\Docker for Windows.exe');

    });

    // Restore process.platform
    after(() => {
      resetPlatform();
      delete process.env.ProgramW6432;
    });

  });

  // This is the method:os we are testing
  describe('#buildDockerCmd:darwin', () => {

    // Set process.platform
    before(() => {
      setPlatform('darwin');
    });

    it('should return correct command on darwin', () => {

      // Get the command
      const cmd = env.buildDockerCmd();
      expect(cmd).to.have.length(2);
      expect(cmd[0]).to.equal('open');

      // Assert the things
      expect(cmd[1]).to.equal('/Applications/Docker.app');

    });

    // Restore process.platform
    after(() => {
      resetPlatform();
    });

  });

  // This is the method:os we are testing
  describe('#buildDockerCmd:linux', () => {

    // Set process.platform
    before(() => {
      setPlatform('linux');
    });

    it('should return systemctl command if possible', () => {

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

    it('should otherwise return services command on linux as fallback', () => {

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

      // Restore to real FS
      filesystem.restore();

    });

    // Restore process.platform
    after(() => {
      resetPlatform();
    });

  });

});
