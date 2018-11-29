/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://github.com/lando/leia for more
 * information on how all this magic works
 *
 * id: redis-example
 * runs-from: ../examples/redis
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

/* eslint-disable max-len */

describe('redis-example', function() {
  this.retries(6);

  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('start up the redis', done => {
    process.chdir(path.resolve(__dirname, '../examples/redis'));
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
  it('verify the app booted up correctly and is showing redis data', done => {
    process.chdir(path.resolve(__dirname, '../examples/redis'));
    const cli = new CliTest();
    cli.exec('lando ssh appserver -c "curl localhost | grep run_id"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify redis version', done => {
    process.chdir(path.resolve(__dirname, '../examples/redis'));
    const cli = new CliTest();
    cli.exec('lando ssh appserver -c "curl localhost | grep redis_version | grep 3.2."').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify that redis was started in append only mode', done => {
    process.chdir(path.resolve(__dirname, '../examples/redis'));
    const cli = new CliTest();
    cli.exec('docker inspect redis_cache_1 | grep appendonly').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify redis portforward', done => {
    process.chdir(path.resolve(__dirname, '../examples/redis'));
    const cli = new CliTest();
    cli.exec('docker inspect redis_cache_1 | grep HostPort | grep 6380 && lando info | grep port | grep 6380').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we have the redis cli', done => {
    process.chdir(path.resolve(__dirname, '../examples/redis'));
    const cli = new CliTest();
    cli.exec('lando redis-cli --version | grep 3.2.').then(res => {
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
  it('destroy the redis', done => {
    process.chdir(path.resolve(__dirname, '../examples/redis'));
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
