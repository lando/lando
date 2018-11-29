/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://github.com/lando/leia for more
 * information on how all this magic works
 *
 * id: laravel-recipe-example
 * runs-from: ../examples/laravel
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

/* eslint-disable max-len */

describe('laravel-recipe-example', function() {
  this.retries(6);

  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('start the app', done => {
    process.chdir(path.resolve(__dirname, '../examples/laravel'));
    const cli = new CliTest();
    cli.exec('if [ -d "web" ]; then rm -Rf web; fi && lando start').then(res => {
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
  it('test spinning up a new laravel app', done => {
    process.chdir(path.resolve(__dirname, '../examples/laravel'));
    const cli = new CliTest();
    cli.exec('lando laravel new web').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('test we can use artisan tooling', done => {
    process.chdir(path.resolve(__dirname, '../examples/laravel'));
    const cli = new CliTest();
    cli.exec('lando ssh -c "cd web && php artisan"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we can visit the homepage', done => {
    process.chdir(path.resolve(__dirname, '../examples/laravel'));
    const cli = new CliTest();
    cli.exec('lando ssh -c "curl nginx |grep Laravel"').then(res => {
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
  it('remove the test laravel app', done => {
    process.chdir(path.resolve(__dirname, '../examples/laravel'));
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
