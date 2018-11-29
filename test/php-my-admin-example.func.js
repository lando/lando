/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://github.com/lando/leia for more
 * information on how all this magic works
 *
 * id: php-my-admin-example
 * runs-from: ../examples/pma
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

/* eslint-disable max-len */

describe('php-my-admin-example', function() {
  this.retries(6);

  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('start up pma', done => {
    process.chdir(path.resolve(__dirname, '../examples/pma'));
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
  it('verify the pma site is working', done => {
    process.chdir(path.resolve(__dirname, '../examples/pma'));
    const cli = new CliTest();
    cli.exec('lando ssh appserver -c "curl -I pma.lemp.lndo.site | grep 200 | grep OK"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify the databases are up and good', done => {
    process.chdir(path.resolve(__dirname, '../examples/pma'));
    const cli = new CliTest();
    cli.exec('lando ssh database -c "mysql -ulemp -plemp lemp -e\"quit\"" && lando ssh database2 -c "mysql -umariadb -ppassword database -e\"quit\""').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify our databases are hooked up to pma', done => {
    process.chdir(path.resolve(__dirname, '../examples/pma'));
    const cli = new CliTest();
    cli.exec('lando ssh pma -c "env | grep PMA_HOSTS=database,database2"').then(res => {
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
  it('destroy pma', done => {
    process.chdir(path.resolve(__dirname, '../examples/pma'));
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
