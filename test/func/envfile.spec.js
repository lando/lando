/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://docs.devwithlando.io/dev/testing.html#functional-tests for more
 * information on how all this magic works
 *
 * title: env-example
 * src: examples/envfile
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

// eslint-disable max-len

describe('envfile', () => {
  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('start up the example', done => {
    process.chdir('examples/envfile');
    const cli = new CliTest();
    cli.exec('sleep 3 && node ../../bin/lando.js start').then(res => {
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
  it('verify env loaded within app directory', done => {
    process.chdir('examples/envfile');
    const cli = new CliTest();
    cli.exec('sleep 3 && (node ../../bin/lando.js info envfile | grep "Trouble parsing .env" && echo ".env Lost" || echo ".env Loaded") | grep ".env Loaded"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('verify env loaded when working in subdirectory', done => {
    process.chdir('examples/envfile');
    const cli = new CliTest();
    cli.exec('sleep 3 && absoluteLandoPath=$(pwd)/../../bin/lando.js && mkdir -p "apples" && cd "apples" && ( (node ../../bin/lando.js info envfile || node ${absoluteLandoPath} info envfile) | grep "Trouble parsing .env" && echo ".env Lost" || echo ".env Loaded") | grep ".env Loaded"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('verify env loaded when working outside of app root', done => {
    process.chdir('examples/envfile');
    const cli = new CliTest();
    cli.exec('sleep 3 && absoluteLandoPath=$(pwd)/../../bin/lando.js && cd $(mktemp -d) && ( (node ../../bin/lando.js info envfile || node ${absoluteLandoPath} info envfile) | grep "Trouble parsing .env" && echo ".env Lost" || echo ".env Loaded") | grep ".env Loaded"').then(res => {
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
  it('destroy the envfile environment', done => {
    process.chdir('examples/envfile');
    const cli = new CliTest();
    cli.exec('sleep 3 && rm -r apples && node ../../bin/lando.js destroy -y').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });
});
