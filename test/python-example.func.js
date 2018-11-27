/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://github.com/lando/leia for more
 * information on how all this magic works
 *
 * id: python-example
 * runs-from: ../examples/python
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

// eslint-disable max-len

describe('python-example', function() {
  this.retries(6);

  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('start up this python app', done => {
    process.chdir(path.resolve(__dirname, '../examples/python'));
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
    process.chdir(path.resolve(__dirname, '../examples/python'));
    const cli = new CliTest();
    cli.exec('lando ssh appserver -c "curl localhost | grep CAUSELOVINGHIMWASRED"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we have the python cli', done => {
    process.chdir(path.resolve(__dirname, '../examples/python'));
    const cli = new CliTest();
    cli.exec('lando python --version').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we have the right python version', done => {
    process.chdir(path.resolve(__dirname, '../examples/python'));
    const cli = new CliTest();
    cli.exec('lando python -V | grep 3.6.').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we have pip cli', done => {
    process.chdir(path.resolve(__dirname, '../examples/python'));
    const cli = new CliTest();
    cli.exec('lando pip -V').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we have the easy install cli', done => {
    process.chdir(path.resolve(__dirname, '../examples/python'));
    const cli = new CliTest();
    cli.exec('lando easy_install --version').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we have the pyvenv cli', done => {
    process.chdir(path.resolve(__dirname, '../examples/python'));
    const cli = new CliTest();
    cli.exec('lando pyvenv --help').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we have the livereload tool', done => {
    process.chdir(path.resolve(__dirname, '../examples/python'));
    const cli = new CliTest();
    cli.exec('lando livereload -h').then(res => {
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
  it('kill the python', done => {
    process.chdir(path.resolve(__dirname, '../examples/python'));
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
