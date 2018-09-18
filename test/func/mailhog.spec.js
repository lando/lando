/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://docs.devwithlando.io/dev/testing.html#functional-tests for more
 * information on how all this magic works
 *
 * title: mail-hog-example
 * src: examples/mailhog
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

// eslint-disable max-len

describe('mailhog', () => {
  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('start up the mailhog', done => {
    process.chdir('examples/mailhog');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js start').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  // These tests are the main event
  // @todo: It would be nice to eventually get these into mocha after hooks
  // so they run after every test
  it('verify mailhog portforward', done => {
    process.chdir('examples/mailhog');
    const cli = new CliTest();
    cli.exec('docker inspect mailhog_mailhog_1 | grep HostPort | grep 1026 && node ../../bin/lando.js info | grep 1026').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('verify the mhsendmail binary was installed', done => {
    process.chdir('examples/mailhog');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js ssh appserver -c "ls -lsa /usr/local/bin | grep mhsendmail"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('verify we can send and recieve mail', done => {
    process.chdir('examples/mailhog');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js alert && node ../../bin/lando.js ssh -c "curl mailhog/api/v2/messages | grep leiaorgana@rebellion.mil"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('destroy the mailhog', done => {
    process.chdir('examples/mailhog');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js destroy -y').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });
});
