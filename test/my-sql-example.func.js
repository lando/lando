/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://github.com/lando/leia for more
 * information on how all this magic works
 *
 * id: my-sql-example
 * runs-from: ../examples/mysql
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

// eslint-disable max-len

describe('my-sql-example', function() {
  this.retries(6);

  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('start up the mysql', done => {
    process.chdir(path.resolve(__dirname, '../examples/mysql'));
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
  it('verify the correct version is being used', done => {
    process.chdir(path.resolve(__dirname, '../examples/mysql'));
    const cli = new CliTest();
    cli.exec('lando ssh database -c "mysql -V | grep 5.7."').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify the databases was setup correctly', done => {
    process.chdir(path.resolve(__dirname, '../examples/mysql'));
    const cli = new CliTest();
    cli.exec('lando ssh database -c "mysql -umysql -ppassword database -e\"quit\""').then(res => {
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
  it('destroy the mysql', done => {
    process.chdir(path.resolve(__dirname, '../examples/mysql'));
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
