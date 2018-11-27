/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://github.com/lando/leia for more
 * information on how all this magic works
 *
 * id: maria-db-example
 * runs-from: ../examples/mariadb
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

// eslint-disable max-len

describe('maria-db-example', function() {
  this.retries(6);

  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('start up the mariadb', done => {
    process.chdir(path.resolve(__dirname, '../examples/mariadb'));
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
  it('verify mariadb portforward', done => {
    process.chdir(path.resolve(__dirname, '../examples/mariadb'));
    const cli = new CliTest();
    cli.exec('docker inspect mariadb_database_1 | grep HostPort | grep 3307 && lando info | grep port | grep 3307').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify the correct version is being used', done => {
    process.chdir(path.resolve(__dirname, '../examples/mariadb'));
    const cli = new CliTest();
    cli.exec('lando ssh database -c "mysql -V | grep 10.1."').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify the databases was setup correctly', done => {
    process.chdir(path.resolve(__dirname, '../examples/mariadb'));
    const cli = new CliTest();
    cli.exec('lando ssh database -c "mysql -umariadb -pmariadb mariadb -e\"quit\""').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify the custom config file was used', done => {
    process.chdir(path.resolve(__dirname, '../examples/mariadb'));
    const cli = new CliTest();
    cli.exec('lando ssh database -c "mysql -u root -e \'show variables;\' | grep key_buffer_size | grep 4404"').then(res => {
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
  it('destroy the mariadb', done => {
    process.chdir(path.resolve(__dirname, '../examples/mariadb'));
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
