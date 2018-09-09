/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://docs.devwithlando.io/dev/testing.html#functional-tests for more
 * information on how all this magic works
 *
 * title: nginx-example
 * src: examples/nginx
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

// eslint-disable max-len

describe('nginx', () => {
  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('start up an nginx server', done => {
    process.chdir('examples/nginx');
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
  it('verify we are using lando certs', done => {
    process.chdir('examples/nginx');
    const cli = new CliTest();
    cli.exec('sleep 10 && node ../../bin/lando.js ssh appserver -c "cat /etc/nginx/conf.d/default.conf | grep ssl_certificate | grep /certs/cert.pem"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('verify the webroot is correct', done => {
    process.chdir('examples/nginx');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js ssh appserver -c "cat /etc/nginx/conf.d/default.conf | grep root | grep /app/www"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('verify the custom config is loaded', done => {
    process.chdir('examples/nginx');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js ssh appserver -c "cat /etc/nginx/conf.d/default.conf | grep CUSTOMTHINGGOTLODADED"').then(res => {
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
  it('destroy the nginx server and clean things up', done => {
    process.chdir('examples/nginx');
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
