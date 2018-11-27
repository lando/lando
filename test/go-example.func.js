/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://github.com/lando/leia for more
 * information on how all this magic works
 *
 * id: go-example
 * runs-from: ../examples/go
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

// eslint-disable max-len

describe('go-example', function() {
  this.retries(6);

  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('start up a very basic go app', done => {
    process.chdir(path.resolve(__dirname, '../examples/go'));
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
  it('verify our go cli version', done => {
    process.chdir(path.resolve(__dirname, '../examples/go'));
    const cli = new CliTest();
    cli.exec('lando go version | grep go1.8.').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we are serving the right thing', done => {
    process.chdir(path.resolve(__dirname, '../examples/go'));
    const cli = new CliTest();
    cli.exec('lando ssh appserver -c "curl localhost | grep YOUDONTKNOWMEATALL"').then(res => {
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
  it('destroy the dotnet app', done => {
    process.chdir(path.resolve(__dirname, '../examples/go'));
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
