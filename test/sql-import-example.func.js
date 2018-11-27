/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://github.com/lando/leia for more
 * information on how all this magic works
 *
 * id: sql-import-example
 * runs-from: ../examples/sql-import
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

// eslint-disable max-len

describe('sql-import-example', function() {
  this.retries(6);

  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('boot up a sql import example', done => {
    process.chdir(path.resolve(__dirname, '../examples/sql-import'));
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
  it('verify the databases are up and good', done => {
    process.chdir(path.resolve(__dirname, '../examples/sql-import'));
    const cli = new CliTest();
    cli.exec('lando ssh database -c "mysql -umysql -pmysql data1 -e\"quit\"" && lando ssh database2 -c "psql -U postgres database -c \'\\\dt\'"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify our dynamic commands work', done => {
    process.chdir(path.resolve(__dirname, '../examples/sql-import'));
    const cli = new CliTest();
    cli.exec('lando psql -h database2 -V && lando mysql -V').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('import the test mysql file against the default database', done => {
    process.chdir(path.resolve(__dirname, '../examples/sql-import'));
    const cli = new CliTest();
    cli.exec('lando db-import test.sql').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('import the test postgres file to the secondary database', done => {
    process.chdir(path.resolve(__dirname, '../examples/sql-import'));
    const cli = new CliTest();
    cli.exec('lando db-import -h database2 test2.sql').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify that we have a users table on both databases', done => {
    process.chdir(path.resolve(__dirname, '../examples/sql-import'));
    const cli = new CliTest();
    cli.exec('lando ssh database -c "mysql -u mysql -pmysql data1 -e \'show tables;\' | grep users" && lando ssh database2 -c "psql -U postgres -h database2 database -c \'\\\dt\' | grep users"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify that after a rebuild we still have the data tables', done => {
    process.chdir(path.resolve(__dirname, '../examples/sql-import'));
    const cli = new CliTest();
    cli.exec('lando rebuild -y && lando ssh database -c "mysql -u mysql -pmysql data1 -e \'show tables;\' | grep users" && lando ssh database2 -c "psql -U postgres -h database2 database -c \'\\\dt\' | grep users"').then(res => {
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
  it('blow up the sql import example', done => {
    process.chdir(path.resolve(__dirname, '../examples/sql-import'));
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
