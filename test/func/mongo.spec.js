/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://docs.devwithlando.io/dev/testing.html#functional-tests for more
 * information on how all this magic works
 *
 * title: mongo-example
 * src: examples/mongo
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

// eslint-disable max-len

describe('mongo', () => {
  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('start up the mongo', done => {
    process.chdir('examples/mongo');
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
  it('verify mongo portforward', done => {
    process.chdir('examples/mongo');
    const cli = new CliTest();
    cli.exec('docker inspect mongo_database_1 | grep HostPort | grep 27018 && node ../../bin/lando.js info | grep port | grep 27018').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('verify the mongo cli is there and we have the correct mongo version', done => {
    process.chdir('examples/mongo');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js mongo --version | grep v3.5.').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('verify the database was setup correctly', done => {
    process.chdir('examples/mongo');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js ssh appserver -c "curl localhost | grep db | grep test"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('verify the custom config file was used', done => {
    process.chdir('examples/mongo');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js ssh database -c "cat /tmp/mongod.log && cat /config.yml"').then(res => {
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
  it('destroy the mongo', done => {
    process.chdir('examples/mongo');
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
