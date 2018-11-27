/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://github.com/lando/leia for more
 * information on how all this magic works
 *
 * id: postgres-example
 * runs-from: ../examples/postgres
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

// eslint-disable max-len

describe('postgres-example', function() {
  this.retries(6);

  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('start up the postgres', done => {
    process.chdir(path.resolve(__dirname, '../examples/postgres'));
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
  it('verify postgres portforward', done => {
    process.chdir(path.resolve(__dirname, '../examples/postgres'));
    const cli = new CliTest();
    cli.exec('docker inspect postgres_tswift_1 | grep HostPort | grep 5444 && lando info | grep port | grep 5444').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify the correct version is being used', done => {
    process.chdir(path.resolve(__dirname, '../examples/postgres'));
    const cli = new CliTest();
    cli.exec('lando ssh tswift -c "psql -V | grep 10.3"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify the database was setup correctly', done => {
    process.chdir(path.resolve(__dirname, '../examples/postgres'));
    const cli = new CliTest();
    cli.exec('lando ssh tswift -c "psql -U trouble trouble -c \'\\\dt\'"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify the custom config file was used', done => {
    process.chdir(path.resolve(__dirname, '../examples/postgres'));
    const cli = new CliTest();
    cli.exec('lando ssh tswift -c "psql -U trouble -c \'SHOW MAX_FILES_PER_PROCESS;\' | grep 999"').then(res => {
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
  it('destroy the postgres', done => {
    process.chdir(path.resolve(__dirname, '../examples/postgres'));
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
