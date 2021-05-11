/**
 * Tests for our build scripts.
 * @file util.spec.js
 */

'use strict';

const _ = require('lodash');
const chai = require('chai');
const originalPlatform = process.platform;
const path = require('path');
chai.should();

const setPlatform = function(platform) {
  Object.defineProperty(process, 'platform', {value: platform});
};
const resetPlatform = function() {
  Object.defineProperty(process, 'platform', {value: originalPlatform});
};

const util = require('./../scripts/util');

describe('scripts', () => {
 describe('#cliTargetOs', () => {
    it('should return macos on darwin', () => {
      setPlatform('darwin');
      util.cliTargetOs().should.equal('macos');
      resetPlatform();
    });

    it('should return win on windoze', () => {
      setPlatform('win32');
      util.cliTargetOs().should.equal('win');
      resetPlatform();
    });

    it('should return linux on linux', () => {
      setPlatform('linux');
      util.cliTargetOs().should.equal('linux');
      resetPlatform();
    });

    it('should return linux on everything else', () => {
      setPlatform('wefwef');
      util.cliTargetOs().should.equal('linux');
      resetPlatform();
    });
  });

  describe('#cliPkgTask', () => {
    it('should return yarn --production as first command', () => {
      const command = util.cliPkgTask('thing');
      command[0].should.equal('yarn install --production');
    });

    it('should return output arg as output file', () => {
      const command = util.cliPkgTask('thing');
      const parts = command[1].split(' ');
      parts[7].should.equal('thing');
    });

    it('should return os target from clitTargetOS', () => {
      const target = util.cliTargetOs();
      const command = util.cliPkgTask('thing');
      const os = command[1].split(' ')[3].split('-')[1];
      os.should.equal(target);
    });

    it('should return chmod+x and sleep as final commands on posix', () => {
      setPlatform('darwin');
      const c1 = util.cliPkgTask('thing');
      c1[2].should.equal('chmod +x thing');
      c1[3].should.equal('sleep 2');
      resetPlatform();
      setPlatform('linux');
      const c2 = util.cliPkgTask('thing');
      c2[2].should.equal('chmod +x thing');
      c2[3].should.equal('sleep 2');
      resetPlatform();
    });

    it('should not return chmod+x and sleep commands on windoze', () => {
      setPlatform('win32');
      const command = util.cliPkgTask('thing');
      command.should.be.length(2);
      resetPlatform();
    });
  });

  describe('#fixAlias', () => {
    it('should return itself if no alias property', () => {
      const command = util.fixAlias({thing: 'stuff'});
      command.thing.should.equal('stuff');
      command.should.not.have.property('name');
    });

    it('should return itself if has alias property but it doesn\'t need wrapping', () => {
      const command = util.fixAlias({alias: 'stuff'});
      command.alias.should.equal('stuff');
      command.should.not.have.property('name');
    });

    it('should return itself if has alias that needs wrapping but alias starts with \\\'lando.', () => {
      const command = util.fixAlias({alias: 'fuck.lando.thing'});
      command.alias.should.equal('fuck.lando.thing');
      command.should.not.have.property('name');
    });

    it('should return adjusted object if alias needs to be wrapped', () => {
      const command = util.fixAlias({alias: 'lando.thing'});
      command.alias.should.equal('lando.thing');
      command.name.should.equal('lando.thing');
      command.scope.should.equal('global');
      command.kind.should.equal('function');
      command.should.not.have.property('memberof');
    });
  });

  describe('#psTask', () => {
    it('should return a powershell command that wraps arg', () => {
      const command = util.psTask('thing');
      command[0].should.equal('PowerShell -NoProfile -ExecutionPolicy Bypass -Command');
      command[1].should.equal('thing');
      command[2].should.equal('&& EXIT /B %errorlevel%');
    });
  });

  describe('#parseCommand', () => {
    it('should return an object with run and opts keys', () => {
      const command = util.parseCommand('thing stuff');
      command.run[0].should.equal('thing');
      command.run[1].should.equal('stuff');
      command.opts.cwd.should.equal(path.resolve('.'));
    });

    it('should have collect mode on posix', () => {
      setPlatform('linux');
      const command = util.parseCommand('thing stuff');
      command.opts.mode.should.equal('collect');
      resetPlatform();
    });

    it('should have no mode on win32', () => {
      setPlatform('win32');
      const command = util.parseCommand('thing stuff');
      command.should.not.have.property('mode');
      resetPlatform();
    });
  });

  describe('#installerPkgTask', () => {
    it('should return scripts/build-darwin.sh on darwin', () => {
      setPlatform('darwin');
      const command = util.installerPkgTask();
      command.should.equal('scripts/build-darwin.sh --arch=amd64');
      resetPlatform();
    });

    it('should use arch amd64 by default', () => {
      setPlatform('darwin');
      const command = util.installerPkgTask();
      command.should.equal('scripts/build-darwin.sh --arch=amd64');
      resetPlatform();
    });

    it('should allow arch to be specified', () => {
      setPlatform('darwin');
      const command = util.installerPkgTask('arm64');
      command.should.equal('scripts/build-darwin.sh --arch=arm64');
      resetPlatform();
    });

    it('should return scripts/build-linux.sh on linux', () => {
      setPlatform('linux');
      const command = util.installerPkgTask();
      command.should.be.a('string');
      command.should.equal('scripts/build-linux.sh --arch=amd64');
      resetPlatform();
    });

    it('should return a PS command that runs scripts\\build-win32.ps1 on windoze', () => {
      setPlatform('win32');
      const command = util.installerPkgTask();
      command.should.be.a('string');
      _.includes(command, 'scripts\\build-win32.ps1').should.be.true;
      resetPlatform();
    });
  });
});
