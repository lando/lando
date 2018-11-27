/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://github.com/lando/leia for more
 * information on how all this magic works
 *
 * id: dockerfile-example
 * runs-from: ../examples/dockerfile
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

// eslint-disable max-len

describe('dockerfile-example', function() {
  this.retries(6);

  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('spin up a lemp stack with a custom and locally built dockerfile', done => {
    process.chdir(path.resolve(__dirname, '../examples/dockerfile'));
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
  it('verify we are using the correct local custom image', done => {
    process.chdir(path.resolve(__dirname, '../examples/dockerfile'));
    const cli = new CliTest();
    cli.exec('docker inspect dockerfile_appserver_1 | grep Image | grep pirog/php:7.1-fpm-custom').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify the provided via dockerfile php extension is loaded', done => {
    process.chdir(path.resolve(__dirname, '../examples/dockerfile'));
    const cli = new CliTest();
    cli.exec('lando php -i | grep pcntl').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify custom volume mounts', done => {
    process.chdir(path.resolve(__dirname, '../examples/dockerfile'));
    const cli = new CliTest();
    cli.exec('lando php -i | grep memory_limit | grep 513M').then(res => {
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
  it('destroy the custom docker image', done => {
    process.chdir(path.resolve(__dirname, '../examples/dockerfile'));
    const cli = new CliTest();
    cli.exec('docker rmi -f pirog/php:7.1-fpm-custom').then(res => {
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
  it('destroy the app', done => {
    process.chdir(path.resolve(__dirname, '../examples/dockerfile'));
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
