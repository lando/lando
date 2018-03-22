'use strict';

const CliTest = require('command-line-test');
const chai = require('chai');
const expect = chai.expect;
const path = require('path');
const fs = require('fs');
chai.should();

describe('basic usage', function() {
  this.timeout(5000);
  beforeEach(function() {
    this.cliTest = new CliTest();
    this.executable = path.resolve(
      __dirname, '..', '..', '..', '..', '..', 'bin', 'lando.js'
    );
  });

  it('requires at least one argument', function() {
    return this.cliTest.execFile(this.executable).then(res => {
      res.should.have.property('error');
      res.error
        .message
        .should
        .contain('You need at least one command before moving on');
    });
  });

  describe('#config', function() {
    it('returns json string', function() {
      return this.cliTest.execFile(this.executable, ['config']).then(res => {
        // This could get risky as the output could have
        // non-standard JSON we need to trim.
        const getJson = function() {
          JSON.parse(res.stdout);
        };
        expect(getJson).to.not.throw('SyntaxError');
      });
    });
  });

  describe('#version', function() {
    it('Returns the version specified in the package.json', function() {
      return this.cliTest.execFile(this.executable, ['version']).then(res => {
        // Grab the Current Package.json version which Lando should be reporting.
        const version = JSON.parse(
          fs.readFileSync(
            path.resolve(
              __dirname, '..', '..', '..', '..', '..', 'package.json'
            )
          )
        ).version;

        res.stdout.should.equal(`v${version}`);
      });
    });
  });

});
