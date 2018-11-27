/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://github.com/lando/leia for more
 * information on how all this magic works
 *
 * id: compose-example
 * runs-from: ../examples/compose
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

// eslint-disable max-len

describe('compose-example', function() {
  this.retries(6);

  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('start up the example', done => {
    process.chdir(path.resolve(__dirname, '../examples/compose'));
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
  it('verify we used the custom image', done => {
    process.chdir(path.resolve(__dirname, '../examples/compose'));
    const cli = new CliTest();
    cli.exec('docker inspect compose_appserver_1 | grep Image | grep drupal:8').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify the lando entrypoint', done => {
    process.chdir(path.resolve(__dirname, '../examples/compose'));
    const cli = new CliTest();
    cli.exec('docker inspect compose_appserver_1 | grep Path | grep lando-entrypoint.sh').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify the custom compose command', done => {
    process.chdir(path.resolve(__dirname, '../examples/compose'));
    const cli = new CliTest();
    cli.exec('docker inspect compose_appserver_1 | grep docker-php-entrypoint && docker inspect compose_appserver_1 | grep apache2-foreground').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify the default mysql creds', done => {
    process.chdir(path.resolve(__dirname, '../examples/compose'));
    const cli = new CliTest();
    cli.exec('sleep 5 && lando ssh database -c "mysql -u mysql -ppassword database -e\"quit\""').then(res => {
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
  it('destroy this example', done => {
    process.chdir(path.resolve(__dirname, '../examples/compose'));
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
