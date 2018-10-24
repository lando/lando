/**
 * Tests for .env loading.
 * @file env.spec.js
 */

'use strict';

const chai = require('chai');
const fs = require('fs');
const path = require('path');
const os = require('os');
const CliTest = require('command-line-test');
chai.should();

const paths = {
  processDir: process.cwd(),
  projectDirectory: path.join(__dirname, '..', '..'),
  envAppDir: path.join(__dirname, '..', '..', 'examples', 'envfile'),
  envAppSubDir: path.join(__dirname, '..', '..', 'examples', 'envfile', 'subdir-test'),
  landoFile: path.join(__dirname, '..', '..', 'bin', 'lando.js'),
};

describe('.env', () => {
  const cli = new CliTest();
  const errorMessage = 'Trouble parsing .env';

  // Ensure Lando environment "envfile" exists
  before(function() {
    // Allow time for environment to be created
    // eslint-disable-next-line no-invalid-this
    this.timeout(15000);

    const initEnvironmentCmd = [
      `cd ${paths.envAppDir}`,
      `node ${paths.landoFile} info envfile`,
    ];

    return cli.exec(initEnvironmentCmd.join(' && '));
  });

  it('should load when working directory is in app.root', done => {
    const testCmd = [
      `cd ${paths.envAppDir}`,
      `node ${paths.landoFile} info envfile`,
    ];

    cli.exec(testCmd.join(' && '))
      .then(res => {
        if (res.stdout !== null) {
          res.stdout.should.not.contain(errorMessage);
          done();
        } else {
          done(res.stderr);
        }
      })
      .catch(error => done(error));
  });

  it('should load when working directory is outside of app root', done => {
    const testCmd = [
      `cd ${os.tmpdir()}`,
      `node ${paths.landoFile} info envfile`,
    ];

    cli.exec(testCmd.join(' && '))
      .then(res => {
        if (res.stdout !== null) {
          res.stdout.should.not.contain(errorMessage);
          done();
        } else {
          done(res.stderr);
        }
      })
      .catch(error => done(error));
  });

  it('should load .env when cwd is a subdirectory of app.root', done => {
    if (!fs.existsSync(paths.envAppSubDir)) {
      fs.mkdirSync(paths.envAppSubDir);
    }

    const testCmd = [
      `cd ${paths.envAppSubDir}`,
      `node ${paths.landoFile} info`,
    ];

    cli.exec(testCmd.join(' && '))
      .then(res => {
        fs.rmdirSync(paths.envAppSubDir);
        if (res.stdout !== null) {
          res.stdout.should.not.contain(errorMessage);
          done();
        } else {
          done(res.stderr);
        }
      })
      .catch(error => done(error));
  });


  // Ensure Lando environment "envfile" is destroyed
  after(function() {
    // Allow time for environment to be destroyed
    // eslint-disable-next-line no-invalid-this
    this.timeout(15000);

    const initEnvironmentCmd = [
      `cd ${paths.envAppDir}`,
      `node ${paths.landoFile} destroy envfile -y`,
    ];

    return cli.exec(initEnvironmentCmd.join(' && '));
  });
});
