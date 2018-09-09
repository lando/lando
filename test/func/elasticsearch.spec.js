/*
 * This file was automatically generated, editing it manually would be foolish
 *
 * See https://docs.devwithlando.io/dev/testing.html#functional-tests for more
 * information on how all this magic works
 *
 * title: elasticsearch-example
 * src: examples/elasticsearch
 */
// We need these deps to run our tezts
const chai = require('chai');
const CliTest = require('command-line-test');
const path = require('path');
chai.should();

// eslint-disable max-len

describe('elasticsearch', () => {
  // These are tests we need to run to get the app into a state to test
  // @todo: It would be nice to eventually get these into mocha before hooks
  // so they run before every test
  it('start up the elastic search example', done => {
    process.chdir('examples/elasticsearch');
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
  it('verify the portforward', done => {
    process.chdir('examples/elasticsearch');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js info | grep 9999').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('verify we have the node cli at the correct version', done => {
    process.chdir('examples/elasticsearch');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js node -v | grep v6.10.').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('verify we have npm', done => {
    process.chdir('examples/elasticsearch');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js npm -v').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('verify we have yarn', done => {
    process.chdir('examples/elasticsearch');
    const cli = new CliTest();
    cli.exec('node ../../bin/lando.js yarn --version').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('verify the es version', done => {
    process.chdir('examples/elasticsearch');
    const cli = new CliTest();
    cli.exec('sleep 10 && node ../../bin/lando.js ssh appserver -c "curl -XGET search:9200 | grep 5.4."').then(res => {
      if (res.error === null) {
        done();
      } else {
        done(res.error);
      }
    });
    process.chdir(path.join('..', '..'));
  });

  it('verify we can access es', done => {
    process.chdir('examples/elasticsearch');
    const cli = new CliTest();
    cli.exec('sleep 10 && node ../../bin/lando.js ssh appserver -c "curl localhost | grep \"All is well\""').then(res => {
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
  it('destroy the app', done => {
    process.chdir('examples/elasticsearch');
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
