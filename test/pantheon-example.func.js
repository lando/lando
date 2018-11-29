/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://github.com/lando/leia for more
 * information on how all this magic works
 *
 * id: pantheon-example
 * runs-from: ../examples/pantheon
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

/* eslint-disable max-len */

describe('pantheon-example', function() {
  this.retries(6);

  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('initialize a pantheon app', done => {
    process.chdir(path.resolve(__dirname, '../examples/pantheon'));
    const cli = new CliTest();
    cli.exec('rm -rf web || true && mkdir web && lando init pantheon --pantheon-auth=$PANTHEON_MACHINE_TOKEN --pantheon-site=drupal-7-pantheon-basicz --dest=web -y').then(res => {
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
  it('start up a pantheon app', done => {
    process.chdir(path.resolve(__dirname, '../examples/pantheon'));
    const cli = new CliTest();
    cli.exec('cd web && lando start').then(res => {
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
  it('run a lando pull', done => {
    process.chdir(path.resolve(__dirname, '../examples/pantheon'));
    const cli = new CliTest();
    cli.exec('cd web && lando pull --code=dev --database=dev --files=dev').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('check terminus is installed', done => {
    process.chdir(path.resolve(__dirname, '../examples/pantheon'));
    const cli = new CliTest();
    cli.exec('cd web && lando terminus --version').then(res => {
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
  it('destroy the pantheon server and clean things up', done => {
    process.chdir(path.resolve(__dirname, '../examples/pantheon'));
    const cli = new CliTest();
    cli.exec('cd web && lando destroy -y').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });
});
