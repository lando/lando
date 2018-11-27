/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://github.com/lando/leia for more
 * information on how all this magic works
 *
 * id: issue-1141
 * runs-from: ../examples/1141-freetype-fpm5.3
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

// eslint-disable max-len

describe('issue-1141', function() {
  this.retries(6);

  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('build the php fpm 5 3 docker image', done => {
    process.chdir(path.resolve(__dirname, '../examples/1141-freetype-fpm5.3'));
    const cli = new CliTest();
    cli.exec('docker build -t landotest/php:5.3-fpm ./../../plugins/lando-services/services/php/5.3-fpm').then(res => {
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
  it('start up an example using that image', done => {
    process.chdir(path.resolve(__dirname, '../examples/1141-freetype-fpm5.3'));
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
  it('verify this app is using the built image from above', done => {
    process.chdir(path.resolve(__dirname, '../examples/1141-freetype-fpm5.3'));
    const cli = new CliTest();
    cli.exec('docker inspect freetypefpm53_appserver_1 | grep Image | grep landotest/php:5.3-fpm').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify that it is rolling with freetype installed', done => {
    process.chdir(path.resolve(__dirname, '../examples/1141-freetype-fpm5.3'));
    const cli = new CliTest();
    cli.exec('lando php -i | grep "with freetype"').then(res => {
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
  it('destroy our custom image', done => {
    process.chdir(path.resolve(__dirname, '../examples/1141-freetype-fpm5.3'));
    const cli = new CliTest();
    cli.exec('docker rmi -f landotest/php:5.3-fpm').then(res => {
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
  it('destroys our custom app', done => {
    process.chdir(path.resolve(__dirname, '../examples/1141-freetype-fpm5.3'));
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
