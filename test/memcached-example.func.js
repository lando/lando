/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://github.com/lando/leia for more
 * information on how all this magic works
 *
 * id: memcached-example
 * runs-from: ../examples/memcached
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

/* eslint-disable max-len */

describe('memcached-example', function() {
  this.retries(6);

  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('start up the memcache', done => {
    process.chdir(path.resolve(__dirname, '../examples/memcached'));
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
  it('verify the app booted up correctly and is showing memcache data', done => {
    process.chdir(path.resolve(__dirname, '../examples/memcached'));
    const cli = new CliTest();
    cli.exec('lando ssh appserver -c "curl localhost | grep server | grep cache:11211"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify memcache portforward', done => {
    process.chdir(path.resolve(__dirname, '../examples/memcached'));
    const cli = new CliTest();
    cli.exec('docker inspect memcached_cache_1 | grep HostPort | grep 11222 && lando info | grep port | grep 11222').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify memcache version', done => {
    process.chdir(path.resolve(__dirname, '../examples/memcached'));
    const cli = new CliTest();
    cli.exec('lando ssh cache -c "memcached -V | grep 1.4."').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify our custom memory setting was passed in', done => {
    process.chdir(path.resolve(__dirname, '../examples/memcached'));
    const cli = new CliTest();
    cli.exec('lando ssh appserver -c "curl localhost | grep limit_maxbytes | grep 268435456"').then(res => {
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
  it('destroy the memcache', done => {
    process.chdir(path.resolve(__dirname, '../examples/memcached'));
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
