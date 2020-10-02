/*
 * Tests for env.
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

const env = require('./../lib/env');

describe('env', () => {
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

  describe('#getComposeExecutable', () => {
    it('should return the correct lando-provided path on win32', () => {
      setPlatform('win32');
      filesystem({'C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker-compose.exe': 'CODEZ'});
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

    it('should return the correct lando-provided path on darwin', () => {
      setPlatform('darwin');
      filesystem({'/Applications/Docker.app/Contents/Resources/bin/docker-compose/docker-compose': 'CODEZ'});
      const composeExecutable = env.getComposeExecutable();
      expect(composeExecutable)
        .to
        .equal('/Applications/Docker.app/Contents/Resources/bin/docker-compose/docker-compose');
      filesystem.restore();
      resetPlatform();
    });

    it('should fall back on POSIX to PATH if the lando-provided one does not exist', () => {
      setPlatform('linux');
      const OLDPATH = process.env.PATH;
      process.env.PATH = '/usr/local/bin';
      filesystem({'/usr/local/bin/docker-compose': 'CODEZ'});
      const composeExecutable = env.getComposeExecutable();
      expect(_.isString(composeExecutable)).to.equal(true);
      expect(path.parse(composeExecutable)).to.be.an('Object');
      filesystem.restore();
      process.env.PATH = OLDPATH;
      resetPlatform();
    });
  });

  describe('#getDockerExecutable', () => {
    it('should return the correct lando-provided path on win32', () => {
      setPlatform('win32');
      filesystem({'C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe': 'CODEZ'});
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

    it('should return the correct lando-provided path on darwin', () => {
      setPlatform('darwin');
      filesystem({'/Applications/Docker.app/Contents/Resources/bin/docker': 'CODEZ'});
      const dockerExecutable = env.getDockerExecutable();
      expect(dockerExecutable).to.equal('/Applications/Docker.app/Contents/Resources/bin/docker');
      filesystem.restore();
      resetPlatform();
    });

    it('should fall back to an in PATH provided path if docker is not in the usual place', () => {
      setPlatform('linux');
      const OLDPATH = process.env.PATH;
      process.env.PATH = '/usr/local/bin';
      filesystem({'/usr/local/bin/docker': 'CODEZ'});
      const dockerExecutable = env.getDockerExecutable();
      expect(_.isString(dockerExecutable)).to.equal(true);
      expect(path.parse(dockerExecutable)).to.be.an('Object');
      filesystem.restore();
      process.env.PATH = OLDPATH;
      resetPlatform();
    });
  });
});
