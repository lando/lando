/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://docs.devwithlando.io/dev/testing.html#functional-tests for more
 * information on how all this magic works
 *
 * title: drupal-8-composer-recipe-example
 * src: examples/drupal8
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

// eslint-disable max-len

describe('drupal8', () => {
  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('start the drupal 8 example recipe', done => {
    process.chdir('examples/drupal8');
    const cli = new CliTest();
    cli.exec('if [ -d "web" ]; then rm -Rf web; fi && if [ -d "vendor" ]; then rm -Rf vendor; fi && node ../../bin/lando.js start && node ../../bin/lando.js composer install && node ../../bin/lando.js composer drupal-scaffold').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  // These tests are the main event
  // @todo: It would be nice to eventually get these into mocha after hooks
  // so they run after every test
  it('test that we got a drupal 8 codebase', done => {
    process.chdir('examples/drupal8');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js ssh -c "ls web |grep index.php"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('test removing a database', done => {
    process.chdir('examples/drupal8');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js ssh -c "mysql -udrupal8 -pdrupal8 -h database -e \'drop database if exists drupal8;\'"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('test creating a database', done => {
    process.chdir('examples/drupal8');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js ssh -c "mysql -udrupal8 -pdrupal8 -h database -e \'create database if not exists drupal8;\'"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('test installing drupal 8 via drush', done => {
    process.chdir('examples/drupal8');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js ssh -c "cd web && drush si --db-url=mysql://drupal8:drupal8@database/drupal8 -y"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('test that we can visit the homepage', done => {
    process.chdir('examples/drupal8');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js ssh -c "curl nginx |grep \'No front page content has been created yet.\'"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('destroy the test app', done => {
    process.chdir('examples/drupal8');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js destroy -y').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });
});
