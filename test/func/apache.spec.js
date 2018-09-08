/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://docs.devwithlando.io/dev/testing.html#functional-tests for more
 * information on how all this magic works
 *
 * title: apache-example
 * src: examples/apache
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

// eslint-disable max-len

describe('apache', () => {
  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('start up the example', done => {
    process.chdir('examples/apache');
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
  it('verify we actually have the correct version of apache', done => {
    process.chdir('examples/apache');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js ssh html -c "apachectl -V | grep Apache/2.2"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('verify lando webroot is set correctly', done => {
    process.chdir('examples/apache');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js ssh html -c "env | grep LANDO_WEBROOT=/app/web"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('verify that lando certs are being used', done => {
    process.chdir('examples/apache');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js ssh html -c "cat /usr/local/apache2/conf/httpd.conf | grep SSLCertificateFile | grep /certs/cert.crt"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('verify that our custom envvar is in there', done => {
    process.chdir('examples/apache');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js ssh html -c "env | grep STUFF=THINGS"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('verify that weve exposed port 8081 correctly', done => {
    process.chdir('examples/apache');
    const cli = new CliTest();
    cli.exec('docker inspect apache_html_1 | grep HostPort | grep 8081 && node ../../bin/lando.js info | grep http://localhost:8081').then(res => {
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
    process.chdir('examples/apache');
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
