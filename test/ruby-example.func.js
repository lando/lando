/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://github.com/lando/leia for more
 * information on how all this magic works
 *
 * id: ruby-example
 * runs-from: ../examples/ruby
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

/* eslint-disable max-len */

describe('ruby-example', function() {
  this.retries(6);

  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('start up this ruby app', done => {
    process.chdir(path.resolve(__dirname, '../examples/ruby'));
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
  it('verify we are serving the right thing', done => {
    process.chdir(path.resolve(__dirname, '../examples/ruby'));
    const cli = new CliTest();
    cli.exec('lando ssh appserver -c "curl localhost | grep TROUBLETROUBLETROUBLE"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we have the ruby cli', done => {
    process.chdir(path.resolve(__dirname, '../examples/ruby'));
    const cli = new CliTest();
    cli.exec('lando ruby -v').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we have the right ruby version', done => {
    process.chdir(path.resolve(__dirname, '../examples/ruby'));
    const cli = new CliTest();
    cli.exec('lando ruby -v | grep 2.4.').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we have bundler cli', done => {
    process.chdir(path.resolve(__dirname, '../examples/ruby'));
    const cli = new CliTest();
    cli.exec('lando bundler -v').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we have the gem cli', done => {
    process.chdir(path.resolve(__dirname, '../examples/ruby'));
    const cli = new CliTest();
    cli.exec('lando gem -v').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we have the travis cli', done => {
    process.chdir(path.resolve(__dirname, '../examples/ruby'));
    const cli = new CliTest();
    cli.exec('lando travis version').then(res => {
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
  it('kill ruby', done => {
    process.chdir(path.resolve(__dirname, '../examples/ruby'));
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
