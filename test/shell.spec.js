/**
 * Tests for shell module.
 * @file shell.spec.js
 */

'use strict';

const _ = require('lodash');
const _shell = require('shelljs');
const child = require('child_process');
const chai = require('chai');
const expect = chai.expect;
const filesystem = require('mock-fs');
const os = require('os');
const path = require('path');
const sinon = require('sinon');
const Shell = require('./../lib/shell');
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));
chai.should();

// Return mock error code based on commands
const errorCode = cmd => {
  return !_.includes(cmd, 'bomb') ? 0 : _.random(1, 666);
};

// Fake Spawner
const fakeSpawn = (cmd, args, opts) => {
  const command = cmd + ' ' + args.join(' ');
  return {
    connected: !_.includes(command, 'van the man'),
    stdout: {on: (type, fn) => {
        fn(Buffer.from('SPAWN: ' + command, 'utf8'));
      },
    },
    on: (type, fn) => {
      if (type === 'error') fn(Buffer.from('ERROR', 'utf8'));
      else if (type === 'close') fn(errorCode(command));
    },
  };
};

// Fake execer
const fakeExec = (cmd, opts, resolve) => {
  resolve(errorCode(cmd), 'EXEC: ' + cmd, '');
};

describe('shell', () => {
  describe('#Shell', () => {
    it('should return a Shell instance with correct default options', () => {
      const shell = new Shell();
      shell.should.be.instanceof(Object);
      shell.should.have.property('log');
    });
  });

  describe('#sh', () => {
    it('should use shelljs.exec when mode is exec and detached is false', () => {
      const shell = new Shell();
      sinon.stub(_shell, 'exec').callsFake(fakeExec);
      return shell.sh(['slip', 'sliding', 'away'])
        .then(result => {
          result.should.equal('EXEC: slip sliding away');
        })
        .then(_shell.exec.restore())
        .should.be.fulfilled;
    });

    it('should use child_process.spawn when mode is not exec or detached is true', () => {
      const shell = new Shell();
      sinon.stub(child, 'spawn').callsFake(fakeSpawn);
      _.forEach([{mode: 'collect'}, {detached: true}], opts => {
        return shell.sh(['tupelo', 'honey', 'baby'], opts)
          .then(result => {
            result.should.equal('SPAWN: tupelo honey baby');
          })
          .should.be.fulfilled;
      });
      child.spawn.restore();
    });

    it('should reject on a non zero code with stderr as the message', () => {
      const shell = new Shell();
      sinon.stub(child, 'spawn').callsFake(fakeSpawn);
      return shell.sh(['set', 'us', 'up', 'the', 'bomb'], {mode: 'attach'}).should.be.rejected
        .then(child.spawn.restore());
    });

    it('should resolve immediately when detached is true and run.connected is false', () => {
      const shell = new Shell();
      sinon.stub(child, 'spawn').callsFake(fakeSpawn);
      return shell.sh(['van', 'the', 'man'], {detached: true}).should.be.fulfilled
        .then(child.spawn.restore());
    });

    it('should ignore stdin and pipe stdout and stderr when process.lando is not node', () => {
      const shell = new Shell();
      process.lando = 'browser';
      sinon.stub(child, 'spawn').callsFake((cmd, args, opts) => {
        opts.stdio[0].should.equal('ignore');
        opts.stdio[1].should.equal('pipe');
        opts.stdio[2].should.equal('pipe');
        return {
          stdout: {on: sinon.spy()},
          stderr: {on: sinon.spy()},
          on: (type, fn) => {
            if (type === 'close') fn(0);
          },
        };
      });
      return shell.sh(['van', 'the', 'man'], {mode: 'attach'}).should.be.fulfilled
        .then(child.spawn.restore())
        .then(() => {
          delete process.lando;
        });
    });

    it('should inherit stdio when process.lando is node', () => {
      const shell = new Shell();
      process.lando = 'node';
      sinon.stub(child, 'spawn').callsFake((cmd, args, opts) => {
        opts.stdio.should.equal('inherit');
        return {
          stdout: {on: sinon.spy()},
          on: (type, fn) => {
            if (type === 'close') fn(0);
          },
        };
      });
      return shell.sh(['van', 'the', 'man'], {mode: 'attach'}).should.be.fulfilled
        .then(child.spawn.restore())
        .then(() => {
          delete process.lando;
        });
    });
  });

  describe('#which', () => {
    const savePath = process.env.PATH;
    beforeEach(() => {
      process.env.PATH = os.tmpdir();
      const bin = {};
      const content = 'Gorillaz on buildings throwing explosive bananas at each other with mathematical precision';
      bin[path.join(os.tmpdir(), 'GORILLA.BAS')] = content;
      filesystem(bin);
    });

    it('should return the same as shelljs.which', () => {
      const shell = new Shell();
      const which1 = shell.which('GORILLA.BAS');
      const which2 = _shell.which('GORILLA.BAS');
      _.toString(which1).should.equal(_.toString(which2));
    });

    it('should return null if command is not found', () => {
      const shell = new Shell();
      const wolfenstein = shell.which('WOLFENSTEIN2D.exe');
      expect(wolfenstein).to.be.null;
    });

    afterEach(() => {
      filesystem.restore();
      process.env.PATH = savePath;
    });
  });
});
