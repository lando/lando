/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://github.com/lando/leia for more
 * information on how all this magic works
 *
 * id: php-apache-services-example
 * runs-from: ../examples/lamp
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

/* eslint-disable max-len */

describe('php-apache-services-example', function() {
  this.retries(6);

  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('starts up a lamp stack using lando services', done => {
    process.chdir(path.resolve(__dirname, '../examples/lamp'));
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
  it('verify that we are being served by apache', done => {
    process.chdir(path.resolve(__dirname, '../examples/lamp'));
    const cli = new CliTest();
    cli.exec('lando ssh appserver -c "curl -Ik https://localhost | grep Server | grep Apache"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify the php cli exists and has the right version', done => {
    process.chdir(path.resolve(__dirname, '../examples/lamp'));
    const cli = new CliTest();
    cli.exec('lando php -v | grep 5.3.').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify the webroot is set correctly', done => {
    process.chdir(path.resolve(__dirname, '../examples/lamp'));
    const cli = new CliTest();
    cli.exec('lando ssh appserver -c "env | grep LANDO_WEBROOT=/app/www"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we have the xdebug extension', done => {
    process.chdir(path.resolve(__dirname, '../examples/lamp'));
    const cli = new CliTest();
    cli.exec('lando php -m | grep Xdebug').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify mysql portforward', done => {
    process.chdir(path.resolve(__dirname, '../examples/lamp'));
    const cli = new CliTest();
    cli.exec('docker inspect lamp_database_1 | grep HostPort | grep 3308 && lando info | grep port | grep 3308').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify the databases was setup correctly', done => {
    process.chdir(path.resolve(__dirname, '../examples/lamp'));
    const cli = new CliTest();
    cli.exec('lando ssh database -c "mysql -ulamp -plamp lamp -e\"quit\""').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we have the composer tool', done => {
    process.chdir(path.resolve(__dirname, '../examples/lamp'));
    const cli = new CliTest();
    cli.exec('lando composer --version').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we have the mysql cli', done => {
    process.chdir(path.resolve(__dirname, '../examples/lamp'));
    const cli = new CliTest();
    cli.exec('lando mysql -V').then(res => {
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
  it('destroys the lamp stack', done => {
    process.chdir(path.resolve(__dirname, '../examples/lamp'));
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
