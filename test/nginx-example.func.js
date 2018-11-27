/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://github.com/lando/leia for more
 * information on how all this magic works
 *
 * id: nginx-example
 * runs-from: ../examples/nginx
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

// eslint-disable max-len

describe('nginx-example', function() {
  this.retries(6);

  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('start up an nginx server', done => {
    process.chdir(path.resolve(__dirname, '../examples/nginx'));
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
  it('verify we are using lando certs', done => {
    process.chdir(path.resolve(__dirname, '../examples/nginx'));
    const cli = new CliTest();
    cli.exec('sleep 10 && lando ssh appserver -c "cat /etc/nginx/conf.d/default.conf | grep ssl_certificate | grep /certs/cert.pem"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify the webroot is correct', done => {
    process.chdir(path.resolve(__dirname, '../examples/nginx'));
    const cli = new CliTest();
    cli.exec('lando ssh appserver -c "cat /etc/nginx/conf.d/default.conf | grep root | grep /app/www"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify the custom config is loaded', done => {
    process.chdir(path.resolve(__dirname, '../examples/nginx'));
    const cli = new CliTest();
    cli.exec('lando ssh appserver -c "cat /etc/nginx/conf.d/default.conf | grep CUSTOMTHINGGOTLODADED"').then(res => {
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
  it('destroy the nginx server and clean things up', done => {
    process.chdir(path.resolve(__dirname, '../examples/nginx'));
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
