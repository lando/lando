/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://github.com/lando/leia for more
 * information on how all this magic works
 *
 * id: backdrop-recipe-example
 * runs-from: ../examples/backdrop
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

/* eslint-disable max-len */

describe('backdrop-recipe-example', function() {
  this.retries(6);

  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('start the backdrop example app', done => {
    process.chdir(path.resolve(__dirname, '../examples/backdrop'));
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
  it('test getting backdrop codebase', done => {
    process.chdir(path.resolve(__dirname, '../examples/backdrop'));
    const cli = new CliTest();
    cli.exec('if [ -d "www" ]; then rm -Rf www; fi && git clone https://github.com/backdrop/backdrop.git www').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify that there is a backdrop code base', done => {
    process.chdir(path.resolve(__dirname, '../examples/backdrop'));
    const cli = new CliTest();
    cli.exec('lando ssh -c "ls www |grep index.php"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('test removing database', done => {
    process.chdir(path.resolve(__dirname, '../examples/backdrop'));
    const cli = new CliTest();
    cli.exec('lando ssh -c "mysql -ubackdrop -pbackdrop -h database -e \'drop database if exists backdrop\'"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('test adding a database', done => {
    process.chdir(path.resolve(__dirname, '../examples/backdrop'));
    const cli = new CliTest();
    cli.exec('lando ssh -c "mysql -ubackdrop -pbackdrop -h database -e \'create database if not exists backdrop\'"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('test installing backdrop via drush', done => {
    process.chdir(path.resolve(__dirname, '../examples/backdrop'));
    const cli = new CliTest();
    cli.exec('lando ssh -c "cd www && drush si --db-url=mysql://backdrop:backdrop@database/backdrop -y"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify that we can visit the homepage', done => {
    process.chdir(path.resolve(__dirname, '../examples/backdrop'));
    const cli = new CliTest();
    cli.exec('lando ssh -c "curl appserver |grep \'This is your first post! You may edit or delete it.\'"').then(res => {
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
  it('destroy the example', done => {
    process.chdir(path.resolve(__dirname, '../examples/backdrop'));
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
