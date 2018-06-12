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

const env = require('./../../lib/env');

describe('lando-engine.env', () => {
  describe('#getDockerBinPath', () => {
    it('should return the correct lando-provided path on win32', () => {
      setPlatform('win32');
      process.env.ProgramW6432 = 'C:\\Program Files';
      const dockerBinPath = env.getDockerBinPath();
      const pf = process.env.ProgramW6432;
      const value = path.win32.join(pf, 'Docker', 'Docker', 'resources', 'bin');
      expect(dockerBinPath).to.equal(value);
      resetPlatform();
      delete process.env.ProgramW6432;
    });

    it('should fallback to the ProgramFiles path on win32', () => {
      setPlatform('win32');
      const holder = process.env.ProgramW6432;
      process.env.ProgramFiles = 'C:\\Program Files';
      delete process.env.ProgramW6432;
      const dockerBinPath = env.getDockerBinPath();
      const pf = process.env.ProgramFiles;
      const value = path.win32.join(pf, 'Docker', 'Docker', 'resources', 'bin');
      expect(dockerBinPath).to.equal(value);
      resetPlatform();
      process.env.ProgramW6432 = holder;
      delete process.env.ProgramFiles;
    });

    it('should return the correct lando-provided path on linux', () => {
      setPlatform('linux');
      const dockerBinPath = env.getDockerBinPath();
      expect(dockerBinPath).to.equal('/usr/share/lando/bin');
      resetPlatform();
    });

    it('should return the correct lando-provided path on darwin', () => {
      setPlatform('darwin');
      const dockerBinPath = env.getDockerBinPath();
      expect(dockerBinPath).to.equal('/Applications/Docker.app/Contents/Resources/bin');
      resetPlatform();
    });
  });

  describe('#getComposeExecutables', () => {
    it('should return the correct lando-provided path on win32', () => {
      setPlatform('win32');
      process.env.ProgramW6432 = 'C:\\Program Files';
      const composeExecutable = env.getComposeExecutable();
      const value = path.win32.join(env.getDockerBinPath(), 'docker-compose.exe');
      expect(composeExecutable).to.equal(value);
      resetPlatform();
      delete process.env.ProgramW6432;
    });

    it('should return the correct lando-provided path on linux', () => {
      setPlatform('linux');
      filesystem({'/usr/share/lando/bin/docker-compose': 'CODEZ'});
      const composeExecutable = env.getComposeExecutable();
      expect(composeExecutable).to.equal('/usr/share/lando/bin/docker-compose');
      filesystem.restore();
      resetPlatform();
    });

    it('should fall back to an in PATH provided path if the lando-provided one does not exist', () => {
      setPlatform('linux');
      process.env.PATH = '/usr/local/bin';
      filesystem({'/usr/local/bin/docker-compose': 'CODEZ'});
      const composeExecutable = env.getComposeExecutable();
      expect(_.isString(composeExecutable)).to.equal(true);
      expect(path.parse(composeExecutable)).to.be.an('Object');
      filesystem.restore();
      resetPlatform();
    });


    it('should return the correct lando-provided path on darwin', () => {
      setPlatform('darwin');
      const composeExecutable = env.getComposeExecutable();
      expect(composeExecutable).to.equal('/Applications/Docker.app/Contents/Resources/bin/docker-compose');
      resetPlatform();
    });
  });

  describe('#getDockerExecutable', () => {
    it('should return the correct lando-provided path on win32', () => {
      setPlatform('win32');
      process.env.ProgramW6432 = 'C:\\Program Files';
      const composeExecutable = env.getDockerExecutable();
      const value = path.win32.join(env.getDockerBinPath(), 'docker.exe');
      expect(composeExecutable).to.equal(value);
      resetPlatform();
      delete process.env.ProgramW6432;
    });

    it('should return the normal system path on linux', () => {
      setPlatform('linux');
      filesystem({'/usr/bin/docker': 'CODEZ'});
      const dockerExecutable = env.getDockerExecutable();
      expect(dockerExecutable).to.equal('/usr/bin/docker');
      filesystem.restore();
      resetPlatform();
    });

    it('should fall back to an in PATH provided path if docker is not in the usual place', () => {
      setPlatform('linux');
      process.env.PATH = '/usr/local/bin';
      filesystem({'/usr/local/bin/docker': 'CODEZ'});
      const dockerExecutable = env.getDockerExecutable();
      expect(_.isString(dockerExecutable)).to.equal(true);
      expect(path.parse(dockerExecutable)).to.be.an('Object');
      filesystem.restore();
      resetPlatform();
    });

    it('should return the correct lando-provided path on darwin', () => {
      setPlatform('darwin');
      const dockerExecutable = env.getDockerExecutable();
      expect(dockerExecutable).to.equal('/Applications/Docker.app/Contents/Resources/bin/docker');
      resetPlatform();
    });
  });

  describe('#buildDockerCmd', () => {
    it('should return correct command on win32', () => {
      setPlatform('win32');
      process.env.ProgramW6432 = 'C:\\Program Files';
      const cmd = env.buildDockerCmd();
      expect(cmd).to.have.length(3);
      expect(cmd[0]).to.equal('cmd');
      expect(cmd[1]).to.equal('/C');
      expect(cmd[2]).to.equal(process.env.ProgramW6432 + '\\Docker\\Docker\\Docker for Windows.exe');
      resetPlatform();
      delete process.env.ProgramW6432;
    });

    it('should fallback to ProgramFiles correctly on win32', () => {
      setPlatform('win32');
      const holder = process.env.ProgramW6432;
      process.env.ProgramFiles = 'C:\\Program Files';
      delete process.env.ProgramW6432;
      const cmd = env.buildDockerCmd();
      expect(cmd).to.have.length(3);
      expect(cmd[0]).to.equal('cmd');
      expect(cmd[1]).to.equal('/C');
      expect(cmd[2]).to.equal(process.env.ProgramFiles + '\\Docker\\Docker\\Docker for Windows.exe');
      resetPlatform();
      process.env.ProgramW6432 = holder;
      delete process.env.ProgramFiles;
    });

    it('should return correct command on darwin', () => {
      setPlatform('darwin');
      const cmd = env.buildDockerCmd();
      expect(cmd).to.have.length(2);
      expect(cmd[0]).to.equal('open');
      expect(cmd[1]).to.equal('/Applications/Docker.app');
      resetPlatform();
    });

    it('should return systemctl command if possible', () => {
      setPlatform('linux');
      process.env.PATH = '/bin';
      filesystem({'/bin/systemctl': 'CODEZ'});
      const operation = 'start';
      const cmd = env.buildDockerCmd(operation);
      expect(cmd).to.have.length(4);
      expect(cmd[0]).to.equal('sudo');
      expect(cmd[1]).to.equal('systemctl');
      expect(cmd[2]).to.equal(operation);
      expect(cmd[3]).to.equal('docker');
      filesystem.restore();
      resetPlatform();
    });

    it('should otherwise return services command on linux as fallback', () => {
      setPlatform('linux');
      delete process.env.PATH;
      filesystem({'/bin/systemctl': 'CODEZ'});
      const operation = 'start';
      const cmd = env.buildDockerCmd(operation);
      expect(cmd).to.have.length(4);
      expect(cmd[0]).to.equal('sudo');
      expect(cmd[1]).to.equal('service');
      expect(cmd[2]).to.equal('docker');
      expect(cmd[3]).to.equal(operation);
      filesystem.restore();
      resetPlatform();
    });
  });
});
