/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://docs.devwithlando.io/dev/testing.html#functional-tests for more
 * information on how all this magic works
 *
 * title: php-my-admin-example
 * src: examples/pma
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

// eslint-disable max-len

describe('pma', () => {
  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('start up pma', done => {
    process.chdir('examples/pma');
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
  it('verify the pma site is working', done => {
    process.chdir('examples/pma');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js ssh appserver -c "curl -I pma.lemp.lndo.site | grep 200 | grep OK"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('verify the databases are up and good', done => {
    process.chdir('examples/pma');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js ssh database -c "mysql -ulemp -plemp lemp -e\"quit\"" && node ../../bin/lando.js ssh database2 -c "mysql -umariadb -ppassword database -e\"quit\""').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('verify our databases are hooked up to pma', done => {
    process.chdir('examples/pma');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js ssh pma -c "env | grep PMA_HOSTS=database,database2"').then(res => {
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
  it('destroy pma', done => {
    process.chdir('examples/pma');
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
