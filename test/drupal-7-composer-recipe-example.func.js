/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://github.com/lando/leia for more
 * information on how all this magic works
 *
 * id: drupal-7-composer-recipe-example
 * runs-from: ../examples/drupal7-2
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

/* eslint-disable max-len */

describe('drupal-7-composer-recipe-example', function() {
  this.retries(6);

  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('start the drupal 7 example recipe', done => {
    process.chdir(path.resolve(__dirname, '../examples/drupal7-2'));
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
  it('test downloading drupal 7 code via composer', done => {
    process.chdir(path.resolve(__dirname, '../examples/drupal7-2'));
    const cli = new CliTest();
    cli.exec('lando composer install').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('test that we got a drupal 7 codebase', done => {
    process.chdir(path.resolve(__dirname, '../examples/drupal7-2'));
    const cli = new CliTest();
    cli.exec('lando ssh -c "ls web |grep index.php"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('test removing a database', done => {
    process.chdir(path.resolve(__dirname, '../examples/drupal7-2'));
    const cli = new CliTest();
    cli.exec('lando ssh -c "mysql -udrupal7 -pdrupal7 -h database -e \'drop database if exists drupal7;\'"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('test creating a database', done => {
    process.chdir(path.resolve(__dirname, '../examples/drupal7-2'));
    const cli = new CliTest();
    cli.exec('lando ssh -c "mysql -udrupal7 -pdrupal7 -h database -e \'create database if not exists drupal7;\'"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('test installing drupal 7 via drush', done => {
    process.chdir(path.resolve(__dirname, '../examples/drupal7-2'));
    const cli = new CliTest();
    cli.exec('lando ssh -c "cd web && drush si --db-url=mysql://drupal7:drupal7@database/drupal7 -y"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('test that we can visit the homepage', done => {
    process.chdir(path.resolve(__dirname, '../examples/drupal7-2'));
    const cli = new CliTest();
    cli.exec('lando ssh -c "curl nginx |grep \'No front page content has been created yet\'"').then(res => {
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
  it('destroy the test app', done => {
    process.chdir(path.resolve(__dirname, '../examples/drupal7-2'));
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
