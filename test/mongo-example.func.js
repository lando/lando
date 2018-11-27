/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://github.com/lando/leia for more
 * information on how all this magic works
 *
 * id: mongo-example
 * runs-from: ../examples/mongo
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

// eslint-disable max-len

describe('mongo-example', function() {
  this.retries(6);

  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('start up the mongo', done => {
    process.chdir(path.resolve(__dirname, '../examples/mongo'));
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
  it('verify mongo portforward', done => {
    process.chdir(path.resolve(__dirname, '../examples/mongo'));
    const cli = new CliTest();
    cli.exec('docker inspect mongo_database_1 | grep HostPort | grep 27018 && lando info | grep port | grep 27018').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify the mongo cli is there and we have the correct mongo version', done => {
    process.chdir(path.resolve(__dirname, '../examples/mongo'));
    const cli = new CliTest();
    cli.exec('lando mongo --version | grep v3.5.').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify the database was setup correctly', done => {
    process.chdir(path.resolve(__dirname, '../examples/mongo'));
    const cli = new CliTest();
    cli.exec('lando ssh appserver -c "curl localhost | grep db | grep test"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify the custom config file was used', done => {
    process.chdir(path.resolve(__dirname, '../examples/mongo'));
    const cli = new CliTest();
    cli.exec('lando ssh database -c "cat /tmp/mongod.log && cat /config.yml"').then(res => {
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
  it('destroy the mongo', done => {
    process.chdir(path.resolve(__dirname, '../examples/mongo'));
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
