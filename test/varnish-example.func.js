/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://github.com/lando/leia for more
 * information on how all this magic works
 *
 * id: varnish-example
 * runs-from: ../examples/varnish
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

/* eslint-disable max-len */

describe('varnish-example', function() {
  this.retries(6);

  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('start up varnish', done => {
    process.chdir(path.resolve(__dirname, '../examples/varnish'));
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
  it('verify we have both a varnish edge and a ssl nginx termination', done => {
    process.chdir(path.resolve(__dirname, '../examples/varnish'));
    const cli = new CliTest();
    cli.exec('docker ps | grep varnish_edge_1 && docker ps | grep varnish_edge_ssl_1').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify that varnish is actually on the edge', done => {
    process.chdir(path.resolve(__dirname, '../examples/varnish'));
    const cli = new CliTest();
    cli.exec('docker inspect varnish_edge_1 | grep HostRegexp:varnish.lndo.site').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we have the right version of varnish', done => {
    process.chdir(path.resolve(__dirname, '../examples/varnish'));
    const cli = new CliTest();
    cli.exec('lando ssh appserver -c "curl -I varnish.lndo.site | grep Via | grep varnish-v4"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we are getting the right things from varnish', done => {
    process.chdir(path.resolve(__dirname, '../examples/varnish'));
    const cli = new CliTest();
    cli.exec('lando ssh appserver -c "curl -I varnish.lndo.site | grep 200 | grep OK" && lando ssh appserver -c "curl -I varnish.lndo.site | grep X-Varnish"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify our custom config file is in the right place', done => {
    process.chdir(path.resolve(__dirname, '../examples/varnish'));
    const cli = new CliTest();
    cli.exec('lando ssh edge -c "cat /etc/varnish/conf.d/custom.vcl | grep WORKINGONSOMENIGHTMOVES"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify the edge ssl container is also serving things', done => {
    process.chdir(path.resolve(__dirname, '../examples/varnish'));
    const cli = new CliTest();
    cli.exec('lando ssh appserver -c "curl -Ik https://edge_ssl | grep 200 | grep OK" && lando ssh appserver -c "curl -Ik https://edge_ssl | grep X-Varnish"').then(res => {
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
  it('destroy varnish', done => {
    process.chdir(path.resolve(__dirname, '../examples/varnish'));
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
