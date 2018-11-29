/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://github.com/lando/leia for more
 * information on how all this magic works
 *
 * id: solr-example
 * runs-from: ../examples/solr
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

/* eslint-disable max-len */

describe('solr-example', function() {
  this.retries(6);

  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('start up the solr', done => {
    process.chdir(path.resolve(__dirname, '../examples/solr'));
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
  it('verify we have an admin page', done => {
    process.chdir(path.resolve(__dirname, '../examples/solr'));
    const cli = new CliTest();
    cli.exec('lando ssh appserver -c "curl -I admin.solr.lndo.site | grep 200 | grep OK"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify solr portforward', done => {
    process.chdir(path.resolve(__dirname, '../examples/solr'));
    const cli = new CliTest();
    cli.exec('docker inspect solr_index_1 | grep HostPort | grep 9999 && lando info | grep port | grep 9999').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify solr version', done => {
    process.chdir(path.resolve(__dirname, '../examples/solr'));
    const cli = new CliTest();
    cli.exec('lando ssh index -c "solr version | grep 5.5."').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify that we have the correct core', done => {
    process.chdir(path.resolve(__dirname, '../examples/solr'));
    const cli = new CliTest();
    cli.exec('lando ssh appserver -c "curl index:8983/solr/admin/cores | grep name | grep freedom"').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
  });

  it('verify we can connect to solr', done => {
    process.chdir(path.resolve(__dirname, '../examples/solr'));
    const cli = new CliTest();
    cli.exec('lando ssh appserver -c "curl solr.lndo.site | grep status | grep OK"').then(res => {
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
  it('destroy the solr', done => {
    process.chdir(path.resolve(__dirname, '../examples/solr'));
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
