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

  it('should load when working directory is in app.root', done => {
    cli.exec(`cd ${paths.envAppDir} && node ${paths.landoFile} ssh -c "env | grep TAYLOR"`)
      .then(res => {
        res.stdout.should.not.contain(errorMessage);
        done();
      })
      .catch(error => {
        done(error);
      });
  });

  it('should load when working directory is outside of app root', done => {
    cli.exec(`cd ${os.tmpDir} && node ${paths.landoFile} ssh appserver envfile `
      + '-c "env | grep TAYLOR" | grep "Trouble parsing .env"')
      .then(res => {
        res.stdout.should.not.contain(errorMessage);
        done();
      })
      .catch(error => {
        console.log('error', error);
        done(error);
      });
  });

  it('should load .env when cwd is a subdirectory of app.root', done => {
    if (!fs.existsSync(paths.envAppSubDir)) {
      fs.mkdirSync(paths.envAppSubDir);
    }

    cli.exec(`cd ${paths.envAppSubDir} && node ${paths.landoFile} ssh appserver envfile `
      + '-c "env | grep TAYLOR" | grep "Trouble parsing .env"')
      .then(res => {
        fs.rmdirSync(paths.envAppSubDir);
        res.stdout.should.not.contain(errorMessage);
        done();
      })
      .catch(error => {
        console.log('error', error);
        done(error);
      });
  });
});
