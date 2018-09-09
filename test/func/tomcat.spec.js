/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://docs.devwithlando.io/dev/testing.html#functional-tests for more
 * information on how all this magic works
 *
 * title: tomcat-example
 * src: examples/tomcat
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

// eslint-disable max-len

describe('tomcat', () => {
  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('start up the solr', done => {
    process.chdir('examples/tomcat');
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
  it('verify tomcat is serving something', done => {
    process.chdir('examples/tomcat');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js ssh appserver -c "curl -I tomcat.lndo.site | grep 200 | grep OK"').then(res => {
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
  it('destroy the tomcat', done => {
    process.chdir('examples/tomcat');
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
