/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://github.com/lando/leia for more
 * information on how all this magic works
 *
 * id: mail-hog-example
 * runs-from: ../examples/mailhog
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

/* eslint-disable max-len */

describe('mail-hog-example', function() {
  this.retries(6);

  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('start up the mailhog', done => {
    process.chdir(path.resolve(__dirname, '../examples/mailhog'));
    const cli = new CliTest();
    cli.exec('lando start').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  // These tests are the main event
  // @todo: It would be nice to eventually get these into mocha after hooks
  // so they run after every test
  it('verify mailhog portforward', done => {
    process.chdir(path.resolve(__dirname, '../examples/mailhog'));
    const cli = new CliTest();
    cli.exec('docker inspect mailhog_mailhog_1 | grep HostPort | grep 1026 && lando info | grep 1026').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify the mhsendmail binary was installed', done => {
    process.chdir(path.resolve(__dirname, '../examples/mailhog'));
    const cli = new CliTest();
    cli.exec('lando ssh appserver -c "ls -lsa /usr/local/bin | grep mhsendmail"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we can send and recieve mail', done => {
    process.chdir(path.resolve(__dirname, '../examples/mailhog'));
    const cli = new CliTest();
    cli.exec('lando alert && lando ssh -c "curl mailhog/api/v2/messages | grep leiaorgana@rebellion.mil"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('destroy the mailhog', done => {
    process.chdir(path.resolve(__dirname, '../examples/mailhog'));
    const cli = new CliTest();
    cli.exec('lando destroy -y').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });
});
