/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://docs.devwithlando.io/dev/testing.html#functional-tests for more
 * information on how all this magic works
 *
 * title: sql-import-example
 * src: examples/sql-import
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

// eslint-disable max-len

describe('sql-import', () => {
  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('boot up a db import example', done => {
    process.chdir('examples/sql-import');
    const cli = new CliTest();
    cli.exec('true').then(res => {
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
  it('verify the databases are up and good', done => {
    process.chdir('examples/sql-import');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js ssh database -c "mysql -umysql -pmysql data1 -e\"quit\"" && node ../../bin/lando.js ssh database2 -c "psql -U postgres database -c \'\\\dt\'"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('verify our dynamic commands work', done => {
    process.chdir('examples/sql-import');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js psql -h database2 -V && node ../../bin/lando.js mysql -V').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('import the test mysql file against the default database', done => {
    process.chdir('examples/sql-import');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js db-import test.sql').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('import the test postgres file to the secondary database', done => {
    process.chdir('examples/sql-import');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js db-import -h database2 test2.sql').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('verify that we have a users table on both databases', done => {
    process.chdir('examples/sql-import');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js ssh database -c "mysql -u mysql -pmysql data1 -e \'show tables;\' | grep users" && node ../../bin/lando.js ssh database2 -c "psql -U postgres -h database2 database -c \'\\\dt\' | grep users"').then(res => {
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
  it('blow up the db import example', done => {
    process.chdir('examples/sql-import');
    const cli = new CliTest();
    cli.exec('true').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });
});
