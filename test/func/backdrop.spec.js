/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://docs.devwithlando.io/dev/testing.html#functional-tests for more
 * information on how all this magic works
 *
 * title: backdrop-recipe-example
 * src: examples/backdrop
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

// eslint-disable max-len

describe('backdrop', () => {
  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('start the backdrop example app', done => {
    process.chdir('examples/backdrop');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js start').then(res => {
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
  it('test getting backdrop codebase', done => {
    process.chdir('examples/backdrop');
    const cli = new CliTest();
    cli.exec('if [ -d "www" ]; then rm -Rf www; fi && git clone https://github.com/backdrop/backdrop.git www').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('verify that there is a backdrop code base', done => {
    process.chdir('examples/backdrop');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js ssh -c "ls www |grep index.php"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('test removing database', done => {
    process.chdir('examples/backdrop');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js ssh -c "mysql -ubackdrop -pbackdrop -h database -e \'drop database if exists backdrop\'"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('test adding a database', done => {
    process.chdir('examples/backdrop');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js ssh -c "mysql -ubackdrop -pbackdrop -h database -e \'create database if not exists backdrop\'"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('test installing backdrop via drush', done => {
    process.chdir('examples/backdrop');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js ssh -c "cd www && drush si --db-url=mysql://backdrop:backdrop@database/backdrop -y"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('verify that we can visit the homepage', done => {
    process.chdir('examples/backdrop');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js ssh -c "curl appserver |grep \'This is your first post! You may edit or delete it.\'"').then(res => {
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
  it('destroy the example', done => {
    process.chdir('examples/backdrop');
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
