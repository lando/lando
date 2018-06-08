/**
 * Tests for shell module.
 * @file shell.spec.js
 */

'use strict';

const _ = require('lodash');
const _esc = require('shell-escape');
const _shell = require('shelljs');
const filesystem = require('mock-fs');
const chai = require('chai');
const expect = chai.expect;
const os = require('os');
const path = require('path');
// const sinon = require('sinon');
const Shell = require('./../../lib/shell');
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));
chai.should();

describe('shell', () => {
  describe('#Shell', () => {
    it('should return a Shell instance with correct default options', () => {
      const shell = new Shell();
      shell.should.be.instanceof(Object);
      shell.should.have.property('log');
    });
  });

  // describe('#sh', function() {
  //   const mockSpawn = require('mock-spawn');
  //   const mySpawn = mockSpawn();
  //   require('child_process').spawn = mySpawn;
  //   mySpawn.setDefault(mySpawn.simple(0, 'hello world'));
  //
  //   it('should spawn if mode or detached', function() {
  //     shell.sh(['ls'], {detached: true}).then(function (ret) {
  //       return mySpawn.calls.length.should.equal(1);
  //     });
  //   });
  //
  //   it('should delegate to exec otherwise', function() {
  //
  //   });
  // });
  describe('#escSpaces', () => {
    it('should return \\\ escaped spaces string on posix', () => {
      const shell = new Shell();
      const thunderRoad = 'doors open but the ride aint free';
      const result = shell.escSpaces(thunderRoad, 'darwin');
      result.should.equal.thunderRoad;
    });

    it('should return ^ escaped string spaces on windoze', () => {
      const shell = new Shell();
      const rosalita = ['come', 'out', 'tonight'];
      const result = shell.escSpaces(rosalita, 'win32');
      result.split('^').should.be.length(3);
    });
  });

  describe('#esc', () => {
    it('should return the same as shell-escape', () => {
      const shell = new Shell();
      const escapee1 = ['git', 'commit', '-m', 'maximum overdrive'];
      const escapee2 = 'git commit -m "all the codez"';
      _.forEach([escapee1, escapee2], escapee => {
        const escape1 = shell.esc(escapee);
        const escape2 = _esc(escapee);
        escape1.should.equal(escape2);
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
